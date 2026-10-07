import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { repository } from '@/server/repository/prismaRepository';
import { shopService } from '@/server/shopService';
import { MessageStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Validates Meta Webhook Signature (HMAC SHA-256)
 */
function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !appSecret) return false;
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf-8')
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(parts[1], 'hex'), Buffer.from(expectedSignature, 'hex'));
}

/**
 * Sends an outbound WhatsApp text message via Meta Cloud API
 */
async function sendWhatsAppReply(to: string, messageText: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured; message logged only.');
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: messageText },
      }),
    });
  } catch (err) {
    console.error('Failed to send outbound WhatsApp message:', err);
  }
}

/**
 * GET: Webhook verification challenge from Meta
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST: Inbound message processor with 7 fixed commands
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.APP_SECRET;

    if (appSecret && !verifySignature(rawBody, signature, appSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const message = changes?.messages?.[0];

    // If not a text message event, acknowledge and exit
    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const fromPhone = message.from; // e.g. "2348012345678"
    const textBody = (message.text?.body || '').trim();

    // Authenticate sender against known user numbers
    const user = await repository.getUserByPhone(fromPhone);
    if (!user) {
      await repository.logWhatsAppMessage({
        fromPhone,
        rawText: textBody,
        status: MessageStatus.UNRECOGNIZED,
      });
      await sendWhatsAppReply(
        fromPhone,
        'Your phone number is not registered with Shopact. Please contact your shop owner.'
      );
      return NextResponse.json({ status: 'unauthorized_sender' }, { status: 200 });
    }

    // Lazy check for 3-month inactivity suspension
    const isSuspended = await shopService.checkInactivityAndSuspend(user.business);
    if (isSuspended) {
      await repository.logWhatsAppMessage({
        businessId: user.business.id,
        fromPhone,
        rawText: textBody,
        status: MessageStatus.ERROR,
      });
      await sendWhatsAppReply(
        fromPhone,
        "This shop's records have been paused after 3 months of no activity. Log in to the dashboard to reactivate."
      );
      return NextResponse.json({ status: 'suspended' }, { status: 200 });
    }

    // Dispatch Command
    const replyText = await handleCommand(textBody, user);
    await sendWhatsAppReply(fromPhone, replyText);

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Command Parser & Handler for 7 fixed patterns
 */
async function handleCommand(text: string, user: NonNullable<Awaited<ReturnType<typeof repository.getUserByPhone>>>): Promise<string> {
  const parts = text.split(/\s+/);
  const command = parts[0]?.toLowerCase();

  // 1. /owa <name> <amount>
  if (command === '/owa' && parts.length === 3) {
    const customerName = parts[1];
    const amountNaira = parseInt(parts[2], 10);
    if (isNaN(amountNaira) || amountNaira <= 0) {
      return 'Amount must be a positive number. Example: /owa Musa 5000';
    }

    const result = await shopService.recordDebt({
      businessId: user.business.id,
      customerName,
      amountKobo: amountNaira * 100,
    });

    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/owa',
      status: MessageStatus.PARSED,
    });

    return result.message || `Recorded: ${customerName} owes ₦${amountNaira.toLocaleString()}.`;
  }

  // 2. /paid <name>
  if (command === '/paid' && parts.length === 2) {
    const customerName = parts[1];
    const result = await shopService.markDebtPaid({
      businessId: user.business.id,
      customerName,
    });

    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/paid',
      status: result.success ? MessageStatus.PARSED : MessageStatus.ERROR,
    });

    return result.success ? result.message! : result.error!;
  }

  // 3. /sold <product> <quantity>
  if (command === '/sold' && parts.length === 3) {
    const productName = parts[1];
    const quantity = parseInt(parts[2], 10);
    if (isNaN(quantity) || quantity <= 0) {
      return 'Quantity must be a positive number. Example: /sold Milk 2';
    }

    const result = await shopService.recordSale({
      businessId: user.business.id,
      productName,
      quantity,
      recordedBy: user,
    });

    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/sold',
      status: result.success ? MessageStatus.PARSED : MessageStatus.ERROR,
    });

    return result.success ? result.message! : result.error!;
  }

  // 4. /bought <product> <quantity> <amount>
  if (command === '/bought' && parts.length === 4) {
    const productName = parts[1];
    const quantity = parseInt(parts[2], 10);
    const amountNaira = parseInt(parts[3], 10);
    if (isNaN(quantity) || quantity <= 0 || isNaN(amountNaira) || amountNaira <= 0) {
      return 'Quantity and amount must be positive numbers. Example: /bought Sugar 10 12000';
    }

    const result = await shopService.recordPurchase({
      businessId: user.business.id,
      productName,
      quantity,
      costKobo: amountNaira * 100,
      recordedBy: user,
    });

    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/bought',
      status: MessageStatus.PARSED,
    });

    return result.message || `Recorded: bought ${quantity} ${productName}.`;
  }

  // 5. /spent <amount> <note>
  if (command === '/spent' && parts.length >= 3) {
    const amountNaira = parseInt(parts[1], 10);
    const note = parts.slice(2).join(' ');

    if (isNaN(amountNaira) || amountNaira <= 0) {
      return 'Amount must be a positive number. Example: /spent 5000 fuel for generator';
    }

    const result = await shopService.recordExpense({
      businessId: user.business.id,
      amountKobo: amountNaira * 100,
      note,
      recordedBy: user,
    });

    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/spent',
      status: result.success ? MessageStatus.PARSED : MessageStatus.ERROR,
    });

    return result.success ? result.message! : result.error!;
  }

  // 6. /stock
  if (command === '/stock') {
    const lowStockItems = await shopService.getLowStock(user.business);
    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/stock',
      status: MessageStatus.PARSED,
    });

    if (lowStockItems.length === 0) {
      return 'Nothing running low.';
    }

    const itemsText = lowStockItems.map((p) => `${p.name}: ${p.quantity} left`).join('\n');
    return `Low Stock Items:\n${itemsText}`;
  }

  // 7. /debts
  if (command === '/debts') {
    const summary = await shopService.getDebtSummary(user.business.id);
    await repository.logWhatsAppMessage({
      businessId: user.business.id,
      fromPhone: user.phone,
      rawText: text,
      parsedCommand: '/debts',
      status: MessageStatus.PARSED,
    });

    if (summary.customerCount === 0) {
      return 'No open debts.';
    }

    const nairaTotal = (summary.totalOwedKobo / 100).toLocaleString();
    return `${summary.customerCount} customers owe you ₦${nairaTotal}. Oldest is ${summary.oldestDays} days.`;
  }

  // Unrecognized pattern
  await repository.logWhatsAppMessage({
    businessId: user.business.id,
    fromPhone: user.phone,
    rawText: text,
    status: MessageStatus.UNRECOGNIZED,
  });

  return `Command not recognized. Use one of these formats:\n• /sold <product> <qty>\n• /bought <product> <qty> <amount>\n• /spent <amount> <note>\n• /owa <name> <amount>\n• /paid <name>\n• /stock\n• /debts`;
}
