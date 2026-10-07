---
trigger: model_decision
description: read before changing command syntax, reply behavior, or messaging transport.
---

# WhatsApp Interface

Source: `Docs/Shop_Act_PRD.md`, FR1 and Technical Architecture.
This file owns command syntax, reply behavior, and messaging transport.

## Command routing

Use these command patterns:

- `/owa <name> <amount>`: Debt creation.
- `/paid <name>`: Debt settlement.
- `/sold <product> <quantity>`: Sale.
- `/bought <product> <quantity> <amount>`: Purchase.
- `/spent <amount> <note>`: Expense.
- `/stock`: Low stock query.
- `/debts`: Open debt summary.

- Match only these seven patterns without partial matching or guessed arguments.
  Reason: FR1 defines a fixed command interface.

- Apply transaction effects from `records-and-data.md`.
  Reason: Interface parsing must not redefine business behavior.

- Apply sender identity and access from `access-and-lifecycle.md`.
  Reason: Identity has one owner across the application.

- Store unmatched messages with status UNRECOGNIZED and reply with the command list.
  Reason: FR1 requires both storage and corrective guidance.

- Treat the expense note as free text inside its fixed command.
  Reason: The PRD permits that field without permitting natural-language commands.

## Supplied replies

- After debt creation, reply `Recorded: <name> owes ₦<amount>.`
  Reason: FR1 specifies this text.

- When no debt is open, reply `<name> has no open debt.`
  Reason: FR1 specifies this result.

- After settlement, reply `Recorded: <name> paid.` and include the remaining count when debts remain.
  Reason: FR1 requires confirmation and outstanding-debt information.

- For insufficient stock, reply `Only <n> <product> left. Sale not recorded.`
  Reason: FR1 specifies this rejection.

- For an empty expense note, reply `Tell me what it was for, for example: /spent 5000 fuel for delivery bike.`
  Reason: FR1 supplies this guidance.

- After an expense, reply `Recorded: expense of ₦<amount>, <note>.`
  Reason: FR1 specifies this confirmation.

## Query replies

- Return every product at or below the business's low stock setting for `/stock`.
  Reason: FR1 includes equality for this query.

- Sort that result by quantity, lowest first.
  Reason: FR1 specifies this order.

- Reply `Nothing running low.` when the result is empty.
  Reason: FR1 specifies this empty result.

- Return total open debt and the oldest open debt's age in days for `/debts`.
  Reason: These are the required summary values.

## Transport

- Connect directly to Meta WhatsApp Cloud API.
  Reason: The PRD excludes an intermediary provider.

- Complete inbound verification before processing a command.
  Reason: Technical Architecture requires verified requests.

- Implement the specified verify-token and X-Hub-Signature-256 requirements.
  Reason: These are the verification mechanisms named by the PRD.

- Send bot replies through the same API using the registered business phone number identity.
  Reason: The PRD specifies that outbound path.

- Report missing Meta verification or number registration as an integration blocker.
  Reason: The WhatsApp interface depends on those prerequisites.

## Decisions required before affected implementation

- Ask about unspecified whitespace, case, multiword names, and argument boundaries.
  Reason: FR1 does not define those parsing cases.

- Ask for missing success replies, invalid-value replies, and empty debt-summary behavior.
  Reason: The supplied reply contract is incomplete.

- Ask whether the customer count shown in the debt-summary example is mandatory.
  Reason: The prose explicitly requires the total and oldest age, while the example adds a count.

- Clarify the verification flow before deciding which checks apply to each request type.
  Reason: The PRD names mechanisms without describing the complete protocol.

- Ask how retries, duplicate deliveries, and failed replies are handled.
  Reason: Delivery failure behavior is unspecified.