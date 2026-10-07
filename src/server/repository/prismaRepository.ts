import { db } from '../db';
import { IShopRepository, LogMessageParams } from './types';
import {
  Business,
  User,
  Customer,
  Product,
  Sale,
  Purchase,
  Expense,
  Debt,
  Alert,
  AuditLog,
  WhatsAppMessage,
  AlertType,
  DebtStatus,
} from '@prisma/client';

export class PrismaShopRepository implements IShopRepository {
  async getBusinessById(id: string): Promise<Business | null> {
    return db.business.findUnique({ where: { id } });
  }

  async getBusinessByOwnerPhone(phone: string): Promise<Business | null> {
    return db.business.findUnique({ where: { ownerPhone: phone } });
  }

  async updateLastActivity(businessId: string): Promise<void> {
    await db.business.update({
      where: { id: businessId },
      data: { lastActivityAt: new Date() },
    });
  }

  async suspendBusiness(businessId: string): Promise<void> {
    await db.business.update({
      where: { id: businessId },
      data: { suspendedAt: new Date() },
    });
  }

  async reactivateBusiness(businessId: string): Promise<void> {
    await db.business.update({
      where: { id: businessId },
      data: { suspendedAt: null, lastActivityAt: new Date() },
    });
  }

  async updateSettings(
    businessId: string,
    data: { lowStockThresholdUnits?: number; largeExpenseThresholdKobo?: number },
    actorId: string
  ): Promise<Business> {
    const current = await db.business.findUniqueOrThrow({ where: { id: businessId } });

    return await db.$transaction(async (tx) => {
      if (
        data.lowStockThresholdUnits !== undefined &&
        data.lowStockThresholdUnits !== current.lowStockThresholdUnits
      ) {
        await tx.auditLog.create({
          data: {
            businessId,
            entityType: 'Business',
            entityId: businessId,
            field: 'lowStockThresholdUnits',
            oldValue: String(current.lowStockThresholdUnits),
            newValue: String(data.lowStockThresholdUnits),
            changedById: actorId,
          },
        });
      }

      if (
        data.largeExpenseThresholdKobo !== undefined &&
        data.largeExpenseThresholdKobo !== current.largeExpenseThresholdKobo
      ) {
        await tx.auditLog.create({
          data: {
            businessId,
            entityType: 'Business',
            entityId: businessId,
            field: 'largeExpenseThresholdKobo',
            oldValue: String(current.largeExpenseThresholdKobo),
            newValue: String(data.largeExpenseThresholdKobo),
            changedById: actorId,
          },
        });
      }

      return tx.business.update({
        where: { id: businessId },
        data,
      });
    });
  }

  async getUserByPhone(phone: string): Promise<(User & { business: Business }) | null> {
    return db.user.findUnique({
      where: { phone },
      include: { business: true },
    });
  }

  async findProductByName(businessId: string, name: string): Promise<Product | null> {
    return db.product.findFirst({
      where: {
        businessId,
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  async createProduct(businessId: string, name: string, quantity: number = 0): Promise<Product> {
    return db.product.create({
      data: {
        businessId,
        name,
        quantity,
      },
    });
  }

  async getLowStockProducts(businessId: string, threshold: number): Promise<Product[]> {
    return db.product.findMany({
      where: {
        businessId,
        quantity: { lte: threshold },
      },
      orderBy: { quantity: 'asc' },
    });
  }

  async getAllProducts(businessId: string): Promise<Product[]> {
    return db.product.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
    });
  }

  async findCustomerByName(businessId: string, name: string): Promise<Customer | null> {
    return db.customer.findFirst({
      where: {
        businessId,
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  async createCustomer(businessId: string, name: string, phone?: string): Promise<Customer> {
    return db.customer.create({
      data: { businessId, name, phone },
    });
  }

  async getOpenDebts(businessId: string): Promise<(Debt & { customer: Customer })[]> {
    return db.debt.findMany({
      where: { businessId, status: DebtStatus.OPEN },
      include: { customer: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOldestOpenDebtForCustomer(businessId: string, customerId: string): Promise<Debt | null> {
    return db.debt.findFirst({
      where: { businessId, customerId, status: DebtStatus.OPEN },
      orderBy: { createdAt: 'asc' },
    });
  }

  async countRemainingOpenDebts(businessId: string, customerId: string): Promise<number> {
    return db.debt.count({
      where: { businessId, customerId, status: DebtStatus.OPEN },
    });
  }

  async recordSale(params: {
    businessId: string;
    productId: string;
    quantity: number;
    totalKobo: number;
    recordedById: string;
  }): Promise<{ sale: Sale; updatedProduct: Product; alert?: Alert }> {
    return await db.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: params.productId },
      });

      if (product.quantity < params.quantity) {
        throw new Error(`Insufficient stock. Only ${product.quantity} left.`);
      }

      const updatedProduct = await tx.product.update({
        where: { id: params.productId },
        data: { quantity: { decrement: params.quantity } },
      });

      const sale = await tx.sale.create({
        data: {
          businessId: params.businessId,
          productId: params.productId,
          quantity: params.quantity,
          totalKobo: params.totalKobo,
          recordedById: params.recordedById,
        },
      });

      const business = await tx.business.findUniqueOrThrow({
        where: { id: params.businessId },
      });

      let alert: Alert | undefined;
      if (updatedProduct.quantity <= business.lowStockThresholdUnits) {
        alert = await tx.alert.create({
          data: {
            businessId: params.businessId,
            type: AlertType.LOW_STOCK,
            refId: updatedProduct.id,
            message: `${updatedProduct.name} is running low (${updatedProduct.quantity} units remaining).`,
          },
        });
      }

      return { sale, updatedProduct, alert };
    });
  }

  async recordPurchase(params: {
    businessId: string;
    productId: string;
    quantity: number;
    costKobo: number;
    recordedById: string;
  }): Promise<{ purchase: Purchase; updatedProduct: Product; alert?: Alert }> {
    return await db.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: params.productId },
        data: { quantity: { increment: params.quantity } },
      });

      const purchase = await tx.purchase.create({
        data: {
          businessId: params.businessId,
          productId: params.productId,
          quantity: params.quantity,
          costKobo: params.costKobo,
          recordedById: params.recordedById,
        },
      });

      return { purchase, updatedProduct };
    });
  }

  async recordExpense(params: {
    businessId: string;
    amountKobo: number;
    note: string;
    recordedById: string;
  }): Promise<{ expense: Expense; alert?: Alert }> {
    return await db.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          businessId: params.businessId,
          amountKobo: params.amountKobo,
          note: params.note,
          recordedById: params.recordedById,
        },
      });

      const business = await tx.business.findUniqueOrThrow({
        where: { id: params.businessId },
      });

      let alert: Alert | undefined;
      if (params.amountKobo >= business.largeExpenseThresholdKobo) {
        alert = await tx.alert.create({
          data: {
            businessId: params.businessId,
            type: AlertType.LARGE_EXPENSE,
            refId: expense.id,
            message: `Large expense recorded: ₦${(params.amountKobo / 100).toLocaleString()} for "${params.note}".`,
          },
        });
      }

      return { expense, alert };
    });
  }

  async recordDebt(params: {
    businessId: string;
    customerId: string;
    amountKobo: number;
  }): Promise<Debt> {
    return db.debt.create({
      data: {
        businessId: params.businessId,
        customerId: params.customerId,
        amountKobo: params.amountKobo,
        status: DebtStatus.OPEN,
      },
    });
  }

  async settleDebt(debtId: string): Promise<Debt> {
    return db.debt.update({
      where: { id: debtId },
      data: {
        status: DebtStatus.PAID,
        paidAt: new Date(),
      },
    });
  }

  async correctRecord(params: {
    businessId: string;
    entityType: string;
    entityId: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedById: string;
    updateFn: () => Promise<void>;
  }): Promise<AuditLog> {
    // Audit must be recorded before updating the record per PRD FR3
    return await db.$transaction(async (tx) => {
      const auditLog = await tx.auditLog.create({
        data: {
          businessId: params.businessId,
          entityType: params.entityType,
          entityId: params.entityId,
          field: params.field,
          oldValue: params.oldValue,
          newValue: params.newValue,
          changedById: params.changedById,
        },
      });

      await params.updateFn();
      return auditLog;
    });
  }

  async getActiveAlerts(businessId: string): Promise<Alert[]> {
    return db.alert.findMany({
      where: { businessId, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    return db.alert.update({
      where: { id: alertId },
      data: { resolvedAt: new Date() },
    });
  }

  async logWhatsAppMessage(params: LogMessageParams): Promise<WhatsAppMessage> {
    return db.whatsAppMessage.create({
      data: {
        fromPhone: params.fromPhone,
        rawText: params.rawText,
        parsedCommand: params.parsedCommand,
        status: params.status,
        ...(params.businessId
          ? { business: { connect: { id: params.businessId } } }
          : {}),
      },
    });
  }

  async exportAllData(businessId: string) {
    const [sales, purchases, expenses, debts, customers, products] = await Promise.all([
      db.sale.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      db.purchase.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      db.expense.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      db.debt.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      db.customer.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
      db.product.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return { sales, purchases, expenses, debts, customers, products };
  }
}

export const repository = new PrismaShopRepository();
