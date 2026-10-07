---
trigger: always_on
---

# Application Architecture

Source: `Docs/Shop_Act_PRD.md`, Technical Architecture.
This file owns application structure.
The existing filename is intentionally preserved.

## Technology roles

- Use App Router for the Next.js application.
  Reason: The PRD specifies that routing architecture.

- Use Prisma as the persistence implementation for PostgreSQL.
  Reason: The PRD specifies that persistence arrangement.

- Ask before adding a Gemini integration.
  Reason: The fixed stack includes Gemini, but no product use is defined.

## Boundaries

- Send sale, purchase, expense, debt, payment-recording, and correction actions through the shared service layer.
  Reason: The PRD requires the same transaction effects from either interface.

- Keep command parsing and reply rendering in the WhatsApp interface.
  Reason: Messaging syntax must not become business logic.

- Keep dashboard rendering in the dashboard interface.
  Reason: Presentation must not create another transaction implementation.

- Keep transaction validation and effects in the shared service layer.
  Reason: Both interfaces must apply the same rules.

- Let dashboard actions reach the service through server actions or internal API routes.
  Reason: The PRD permits those two paths.

- Put Prisma persistence access behind the repository boundary.
  Reason: Technical Architecture specifies that boundary.

- Ask how writes outside the named transaction actions should be organized.
  Reason: The PRD does not map onboarding, session, or message-log writes to service functions.

## Source map

The PRD specifies these paths:

- `src/app/api/whatsapp/webhook/route.ts`: WhatsApp webhook.
- `src/app/dashboard`: Dashboard home.
- `src/app/sales`: Sales view.
- `src/app/inventory`: Inventory view.
- `src/app/expenses`: Expenses view.
- `src/app/debts`: Debts view.
- `src/server/shopService.ts`: Shared transaction service.
- `src/server/repository`: Repository implementation.

- Verify the source map against the repository before editing.
  Reason: A specified path does not prove an implementation exists.

- Ask before choosing unspecified source locations.
  Reason: Settings, authentication, and onboarding locations are not supplied.

## Pending architecture decision

The PRD labels retention of the existing repository interface as an assumption.

- Obtain confirmation before relying on that assumed interface.
  Reason: The current source and the assumption's approval status must be established.