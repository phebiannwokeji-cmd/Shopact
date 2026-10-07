# Shop App

## Product Summary

Shop App is a record-keeping tool for Nigerian micro-retail shop owners. It has two interfaces that write to the same database through one shared logic layer: a WhatsApp bot that the owner and staff use during the day, and a web dashboard the owner uses to review, correct, and act on alerts.

The core loop: a person sends a fixed-format command on WhatsApp, the bot parses it, writes a record, and replies in plain language within seconds. No app install, no login, no form. The dashboard exists for the slower moment, at close of day or when something needs fixing, not for daily recording.

The product tracks four things: sales, purchases (stock coming in), expenses, and debts. It watches three conditions in the background: debts open 7 days or more, stock below a configurable threshold (10 units by default), and expenses at or above a configurable amount (50,000 naira by default). Both thresholds are set per business from the dashboard. When any of these trigger, the owner is told without asking.

## Problem

Small shop owners in Nigeria run their business from memory and a paper book. They sell on credit and lose track of who owes what. They restock by eye and run out without warning. Every existing record-keeping tool asks the owner to stop, open something separate, and fill a form, which does not happen in the middle of serving a customer. The result is not a lack of desire to keep records, it is a mismatch between how records get kept and how the shop actually runs.

## Goals

- Make recording a transaction fast enough to survive a busy counter: under 10 seconds from opening WhatsApp to a confirmed record.
- Guarantee that a sale, debt, purchase, or expense produces the same database state whether it was entered from WhatsApp or the dashboard, because both call the same service layer.
- Surface an aging debt, a low stock item, or a large expense without the owner having to go looking for it.
- Give the owner a single place, the dashboard, to correct a wrong entry and see who changed what.

Non-goals for this version:
- No payment collection. The product only records that a debt exists or was paid, it never moves money.
- No customer-facing automated messages. Every WhatsApp message a customer receives is sent by the owner, one tap, from a prefilled link. The system never messages a customer on its own.
- No multi-shop support. One WhatsApp number maps to one business.
- ASSUMPTION: No free-text sales entry in v1. The command list (/owa, /paid, /sold, /bought, /stock, /debts, /spent) is fixed-format, not natural language, so v1 only needs to parse those seven patterns. This is the simplest correct reading of the idea as written, extended with /spent per confirmed direction below.

## Users and Personas

**Owner.** Runs one shop. Uses WhatsApp all day for personal and business messages already. Opens the dashboard once or twice a day, usually at close, to check what needs attention and fix mistakes. Cares most about not losing money to forgotten debts or empty shelves.

**Staff.** Works the counter for the owner. Records sales, purchases, and expenses on WhatsApp during the day. Confirmed: staff have no dashboard access at all in v1, WhatsApp is their only interface. Staff are trusted employees, not customers, so permission checks are about which actions they can take (record, not correct or delete), not about hiding data from them.

## Scope

**In scope for v1:**
- WhatsApp command parsing for the seven fixed commands, with a plain-language confirmation reply for each.
- Recording sales, purchases, expenses, and debts, and marking a debt paid.
- Automatic alert generation for aging debts, low stock, and large expenses, checked at the moment a relevant record is written.
- A dashboard with an alerts-first home view, full list views for sales, inventory, expenses, and debts, a settings view to configure the low stock and large expense thresholds and export data, and the ability to correct a past entry.
- An audit trail that records who changed what and when, for every correction made on the dashboard.
- Owner and staff roles enforced at the database layer.
- A WhatsApp deep-link button on each alert that opens WhatsApp with a prefilled message, for the owner to send manually.

**Out of scope for v1:**
- Free-text or natural-language WhatsApp messages.
- Any AI-assisted parsing or semantic search (see AI section below, this is flagged as a v2 candidate, not required by the idea as written).
- Multi-shop accounts, payment processing, customer accounts, and automated reminders.

## Functional Requirements

**FR1. WhatsApp command parsing**
The webhook receives every inbound message as raw text and matches it against seven fixed patterns. Any message that does not match one of these patterns is stored with status UNRECOGNIZED and the bot replies with the command list. No partial matching, no guessing.

- `/owa <name> <amount>` creates a debt. Amount must be a positive whole number, treated as naira and converted to kobo (amount times 100) for storage. Reply: `Recorded: <name> owes ₦<amount>.`
- `/paid <name>` marks the customer's oldest open debt as paid. If the customer has no open debt, reply: `<name> has no open debt.` If they have more than one open debt, mark the oldest first and reply with the remaining count: `Recorded: <name> paid. 1 debt still open.`
- `/sold <product> <quantity>` creates a sale. Quantity must be a positive whole number and must not exceed current stock. If it does, reply: `Only <n> <product> left. Sale not recorded.` and do not write the record. Reduce product quantity by the sold amount on success.
- `/bought <product> <quantity> <amount>` creates a purchase. Amount is the total cost in naira for the whole quantity, converted to kobo. Increases product quantity by the purchased amount.
- `/spent <amount> <note>` creates an expense. Amount must be a positive whole number, treated as naira and converted to kobo. Note is required, free text, and is the only description the expense will ever have, so an empty note is rejected: reply `Tell me what it was for, for example: /spent 5000 fuel for delivery bike.` On success, reply: `Recorded: expense of ₦<amount>, <note>.` If the amount meets or exceeds `Business.largeExpenseThresholdKobo`, this is also where the large expense alert is created (FR2).
- `/stock` replies with every product at or below the business's low stock threshold (`Business.lowStockThresholdUnits`, 10 by default), sorted lowest quantity first. If none, reply: `Nothing running low.`
- `/debts` replies with total owed across all open debts and the age in days of the oldest one, for example: `3 customers owe you ₦18,500. Oldest is 14 days.`

**FR2. Alert generation**
Alerts are computed synchronously, right after the write that could trigger them, not on a schedule. ASSUMPTION: no background job or cron exists in v1, since the idea describes alerts firing in response to what the owner just did ("while the owner goes about their day"), not on a timer. A debt crossing 7 days old is the one exception, since no write event causes that, so a debt's age is computed on every `/debts` call and every dashboard load rather than stored as a triggered alert. Low stock and large expense alerts are created as Alert rows at write time and shown on the dashboard until resolved.

Both thresholds are configurable per business, not fixed constants. A `/sold` or `/bought` write checks the product's resulting quantity against `Business.lowStockThresholdUnits`. A new expense record checks its amount against `Business.largeExpenseThresholdKobo`. The values shown in this document (10 units, 50,000 naira) are the defaults set on a new business, not hardcoded thresholds, and the owner can change them from the dashboard settings screen (FR3).

**FR3. Dashboard**
Routes: `/dashboard` (alerts-first home), `/sales`, `/inventory`, `/expenses`, `/debts`, `/settings`. Each list view supports editing a past entry. An edit writes an AuditLog row capturing the field, old value, new value, who made the change, and when, then updates the record in place. ASSUMPTION: edits happen in place rather than as offsetting entries, because the idea explicitly says "they can correct mistakes... and review the audit trail," which describes a direct edit with a paired log, not an append-only ledger.

The `/settings` route lets the owner view and change `lowStockThresholdUnits` and `largeExpenseThresholdKobo` for their business. A change takes effect immediately for the next write, is not retroactive against existing Alert rows, and is itself written to AuditLog the same way any other correction is. Confirmed: both thresholds are configurable per business, not fixed constants.

Confirmed: `/settings` also carries an "Export my data" action, available to an active business, not only a suspended one. It calls the same export function defined in FR7 and produces the same set of files. Exporting from an active business does not change `suspendedAt` or `lastActivityAt`, same as exporting from a suspended one.

Dashboard access is owner-only. Confirmed: staff have no dashboard access at all in v1, WhatsApp is their only interface.

**FR4. WhatsApp deep links**
Each alert on the dashboard has a button that opens `https://wa.me/<customer-or-supplier-phone>?text=<prefilled message>`. The owner reviews and sends manually. The system never sends this message on its own.

**FR5. Roles**
Two roles: OWNER and STAFF. STAFF can create sales, purchases, expenses, and debts on WhatsApp, and can mark a debt paid. STAFF cannot edit past records, delete records, change settings, or access the dashboard in any form. Confirmed: WhatsApp is the only interface staff get in v1.

**FR6. Identity on WhatsApp**
ASSUMPTION: the business has one WhatsApp number that customers never message directly, staff and the owner each message it from their own personal WhatsApp number. Each User row is matched to an inbound message by phone number. This is the only way to know who recorded what, and the idea does not describe an alternative.

**FR7. Suspension and reactivation**
Confirmed: a business with no activity for 3 months has its data suspended until reactivated. Nothing is deleted, the data is only made inaccessible.

`Business.lastActivityAt` is updated to now on every successful WhatsApp command and every dashboard action. There is no separate cron job checking this on a schedule, consistent with FR2, the check is made lazily: at the start of processing any inbound WhatsApp command or any dashboard request, if `now - lastActivityAt >= 3 months` and `suspendedAt` is null, the system sets `suspendedAt = now` in that same request and stops, before doing anything else.

Once `suspendedAt` is set, every WhatsApp command gets one fixed reply instead of being processed: `This shop's records have been paused after 3 months of no activity. Log in to the dashboard to reactivate.` Every dashboard request past the login screen redirects to a suspension screen with two actions: reactivate, or export.

Confirmed: suspended data can be exported on request, whether or not the owner also chooses to reactivate. Export does not require reactivating first. It generates a downloadable file (CSV, one file per record type: sales, purchases, expenses, debts, customers, products) covering every record for that business, built directly from the same Prisma models, run synchronously since a single shop's data is small enough not to need a background job, consistent with FR2 and the rest of this section. Exporting does not change `suspendedAt` or `lastActivityAt`, it is a read, not an activity signal, so an owner can export repeatedly without that alone reactivating the account. The same export function is also reachable from `/settings` for an active business (FR3), suspension is not a requirement to export, only one of two places the action is offered.

Confirmed: suspended data is never automatically deleted. It stays suspended, and exportable, indefinitely until the owner reactivates. Nothing in this product deletes a business's records on its own.

ASSUMPTION: reactivation itself is a single deliberate step, the owner logging into the dashboard with their phone and PIN and confirming reactivation, since the idea says a reactivation is carried out without describing the mechanism, and dashboard login is already the one authenticated action the owner has. Reactivating sets `suspendedAt` back to null and `lastActivityAt` to now. Staff get no reactivation or export path of their own, since they have no dashboard access (FR3, FR5); a suspended business needs its owner regardless of who was using it last.

## Technical Architecture

**Stack:** Next.js (App Router), TypeScript, Prisma, PostgreSQL.

**Layers:**
- WhatsApp webhook: `src/app/api/whatsapp/webhook/route.ts`, receives the inbound POST from Meta's WhatsApp Cloud API, verifies the request against the app's verify token and the `X-Hub-Signature-256` header, parses the command, and calls the shared service layer. Outbound replies (the confirmation messages, `/stock`, `/debts`) go out through the same Cloud API using the business phone number ID issued when the number is registered. No business solution provider sits in between.
- Dashboard routes: `src/app/dashboard`, `src/app/sales`, `src/app/inventory`, `src/app/expenses`, `src/app/debts`, each calling the same service layer through server actions or internal API routes.
- Shared service layer: `src/server/shopService.ts`. Every write, from either interface, goes through one function per action (`recordSale`, `recordPurchase`, `recordExpense`, `recordDebt`, `markDebtPaid`, `correctRecord`), each of which checks stock where relevant, computes totals, writes the record, writes any triggered alert, and returns a result both interfaces can render.
- Repository layer: `src/server/repository`, a Prisma-backed implementation behind an interface, replacing the localStorage implementation described as already built. ASSUMPTION: the interface is kept even though Postgres is now the only backend, since the existing codebase already has this seam and removing it is unnecessary churn.
- Auth: confirmed. Dashboard login uses phone number plus a PIN set by the owner during onboarding, checked against a hashed PIN stored on the User row. Since staff have no dashboard access, this is the owner's login only, no other User row ever needs `pinHash` populated or checked against a dashboard session.

**Prisma data model:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  OWNER
  STAFF
}

enum AlertType {
  AGING_DEBT
  LOW_STOCK
  LARGE_EXPENSE
}

enum MessageStatus {
  PARSED
  UNRECOGNIZED
  ERROR
}

enum DebtStatus {
  OPEN
  PAID
}

model Business {
  id                        String            @id @default(cuid())
  name                      String
  ownerPhone                String            @unique
  lowStockThresholdUnits    Int               @default(10)
  largeExpenseThresholdKobo Int               @default(5000000)
  lastActivityAt            DateTime          @default(now())
  suspendedAt               DateTime?
  createdAt                 DateTime          @default(now())
  users                     User[]
  customers                 Customer[]
  products                  Product[]
  sales                     Sale[]
  purchases                 Purchase[]
  expenses                  Expense[]
  debts                     Debt[]
  alerts                    Alert[]
  auditLogs                 AuditLog[]
  messages                  WhatsAppMessage[]
}

model User {
  id          String     @id @default(cuid())
  businessId  String
  business    Business   @relation(fields: [businessId], references: [id])
  phone       String     @unique
  name        String
  role        Role
  pinHash     String?
  createdAt   DateTime   @default(now())
  sales       Sale[]
  purchases   Purchase[]
  expenses    Expense[]
  auditLogs   AuditLog[]

  @@index([businessId])
}

model Customer {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
  name       String
  phone      String?
  createdAt  DateTime @default(now())
  debts      Debt[]

  @@index([businessId, name])
}

model Product {
  id         String     @id @default(cuid())
  businessId String
  business   Business   @relation(fields: [businessId], references: [id])
  name       String
  quantity   Int        @default(0)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  sales      Sale[]
  purchases  Purchase[]

  @@unique([businessId, name])
}

model Sale {
  id           String   @id @default(cuid())
  businessId   String
  business     Business @relation(fields: [businessId], references: [id])
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  quantity     Int
  totalKobo    Int
  recordedById String
  recordedBy   User     @relation(fields: [recordedById], references: [id])
  createdAt    DateTime @default(now())

  @@index([businessId, createdAt])
}

model Purchase {
  id           String   @id @default(cuid())
  businessId   String
  business     Business @relation(fields: [businessId], references: [id])
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  quantity     Int
  costKobo     Int
  recordedById String
  recordedBy   User     @relation(fields: [recordedById], references: [id])
  createdAt    DateTime @default(now())

  @@index([businessId, createdAt])
}

model Debt {
  id         String     @id @default(cuid())
  businessId String
  business   Business   @relation(fields: [businessId], references: [id])
  customerId String
  customer   Customer   @relation(fields: [customerId], references: [id])
  amountKobo Int
  status     DebtStatus @default(OPEN)
  createdAt  DateTime   @default(now())
  paidAt     DateTime?

  @@index([businessId, status, createdAt])
}

model Expense {
  id           String   @id @default(cuid())
  businessId   String
  business     Business @relation(fields: [businessId], references: [id])
  amountKobo   Int
  note         String?
  recordedById String
  recordedBy   User     @relation(fields: [recordedById], references: [id])
  createdAt    DateTime @default(now())

  @@index([businessId, createdAt])
}

model Alert {
  id         String    @id @default(cuid())
  businessId String
  business   Business  @relation(fields: [businessId], references: [id])
  type       AlertType
  refId      String
  message    String
  createdAt  DateTime  @default(now())
  resolvedAt DateTime?

  @@index([businessId, resolvedAt])
}

model AuditLog {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id])
  entityType  String
  entityId    String
  field       String
  oldValue    String
  newValue    String
  changedById String
  changedBy   User     @relation(fields: [changedById], references: [id])
  changedAt   DateTime @default(now())

  @@index([businessId, entityType, entityId])
}

model WhatsAppMessage {
  id            String        @id @default(cuid())
  businessId    String?
  business      Business?     @relation(fields: [businessId], references: [id])
  fromPhone     String
  rawText       String
  parsedCommand String?
  status        MessageStatus
  createdAt     DateTime      @default(now())

  @@index([fromPhone, createdAt])
}
```

All money fields are plain `Int`, storing kobo (naira times 100) as a whole number, never a float, to avoid rounding errors on currency math. `User.pinHash` is optional at the schema level but only ever populated for the OWNER row on a business, since STAFF never log in anywhere.

## Business Model

The idea does not state a business model. Confirmed: the product runs free for a one-month test period. At the end of that month, whether to charge at all is decided based on how the test went. The success metrics in this document (recording share, week-3 retention, alert follow-through) are the evidence that decision is made from.

If the test supports charging, the price is confirmed: ₦5,000 per month per user. Since only the owner ever has a login (FR3, FR5), this resolves in practice to ₦5,000 per month per business account, one subscription per shop.

ASSUMPTION: no transaction fees, since the product never moves money, and no tiered feature gating in v1, since the product is small enough that splitting it into tiers would add complexity without a clear reason yet.

## Success Metrics

All of the metrics below are read together at the end of the one-month test period to decide whether and what to charge (see Business Model). None of them individually is a pass or fail line on its own.

- Share of all recorded sales, purchases, and expenses entered via WhatsApp rather than the dashboard. Target above 80 percent, since a low number would mean the core bet, that WhatsApp is where recording actually happens, is not holding.
- Percentage of active businesses that send at least one command in week 3 after signup, having sent at least one in week 1. This is the direct test of the habit risk.
- Median time from an `/owa` or `/sold` message being received to the confirmation reply being sent, target under 3 seconds, since delay breaks the "as easy as talking to a staff member" promise.
- Percentage of debts marked paid within 30 days of being recorded.
- Percentage of low stock alerts followed by a matching `/bought` entry within 48 hours, as a proxy for whether the alert is actually acted on.
- Ratio of UNRECOGNIZED to PARSED messages, tracked weekly, as the leading indicator for whether the fixed command set is too rigid for real use.

## Risks

- A misparsed or mistyped command creates a wrong record, and the owner does not catch it before it is treated as fact. This is the most severe risk, since it recreates the exact problem the product exists to solve, now inside the product instead of the notebook.
- The seven-command syntax is still a learned syntax, not natural language. An owner who forgets the exact format may abandon the WhatsApp channel before the habit forms, undermining the core bet.
- Without per-user phone number attribution enforced correctly, two staff members could appear as the same sender, making the audit trail meaningless exactly when it is needed most.
- Access to Meta's Cloud API requires Meta's own business verification and phone number registration process, which can take longer than expected and blocks the entire WhatsApp side of the product until approved. Going direct also means no provider support layer to fall back on if Meta's API changes or rate-limits the account.
- The alerts-first dashboard assumes the owner opens it regularly enough to act on alerts. If the owner never opens it, low stock and large expense alerts go unseen, since the idea explicitly rules out pushing them to WhatsApp automatically.

## Open Questions

None remain open as of this revision. Every question raised in earlier drafts has either been confirmed by the product owner or resolved as a stated ASSUMPTION in the Assumptions Log below. Any new gap found during build should be added here, not silently assumed.

## Assumptions Log

1. No free-text sales entry in v1. Only the seven fixed commands are parsed, since that is the simplest correct reading of the idea as written.
2. No background job or cron exists for alerts or for suspension checks in v1. Both are checked lazily, at write time or request time, not on a schedule.
3. Edits to past records happen in place, paired with an AuditLog entry, rather than as offsetting ledger entries. Confirmed: correction is a direct edit plus a log, not an append-only ledger.
4. Staff have no dashboard access in v1, WhatsApp only. Confirmed.
5. The business has one WhatsApp number. Staff and the owner each message it from their own personal number, and are identified by that number, since this is the only way to attribute a record to a person.
6. The repository interface is kept even though Postgres is now the only backend, to avoid unnecessary rework of an existing seam in the codebase.
7. Dashboard login uses phone number plus a PIN. Confirmed.
8. No transaction fees, and no tiered feature gating in v1, since the product is small enough that splitting it into tiers would add complexity without a clear reason yet.
9. Reactivation after suspension is a single step, the owner logging into the dashboard and confirming, since the idea confirms suspension and reactivation happen but does not describe the reactivation mechanism itself.
