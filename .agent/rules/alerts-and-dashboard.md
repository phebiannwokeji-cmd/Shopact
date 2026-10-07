---
trigger: model_decision
description: read before changing dashboard behavior or alert presentation.
---

# Alerts and Dashboard

Source: `Docs/Shop_Act_PRD.md`, FR2, FR3, FR4, and Risks.
This file owns dashboard behavior and alert presentation.

## Views

- Provide `/dashboard`, `/sales`, `/inventory`, `/expenses`, `/debts`, and `/settings`.
  Reason: FR3 names those routes.

- Show alerts first on the dashboard home.
  Reason: The dashboard is the owner's review and action surface.

- Provide full list views for sales, inventory, expenses, and debts.
  Reason: These are the required record views.

- Provide past-entry correction in those list views using `records-and-data.md`.
  Reason: FR3 requires editing while the correction contract belongs elsewhere.

- Use `access-and-lifecycle.md` for dashboard access and settings export.
  Reason: Views must not redefine permissions or export behavior.

## Settings

- Store low stock and large expense settings per business.
  Reason: The PRD excludes fixed global settings.

- Default new businesses to 10 stock units and ₦50,000 for large expenses.
  Reason: The PRD supplies those defaults.

- Apply setting changes to the next relevant write without changing existing alerts.
  Reason: FR3 explicitly makes changes non-retroactive.

- Send setting changes through the audit contract in `records-and-data.md`.
  Reason: FR3 requires the same change history as other corrections.

## Alert behavior

- Check resulting stock after both sales and purchases.
  Reason: FR2 names both transaction types as triggers.

- Create a large expense alert when a new expense meets or exceeds its business setting.
  Reason: FR1 and FR2 specify that comparison.

- Create stock and expense alerts synchronously after the relevant write.
  Reason: FR2 specifies write-time generation.

- Keep saved stock and expense alerts visible until resolved.
  Reason: FR2 specifies their persistence.

- Compute debt age on each `/debts` call and dashboard load.
  Reason: Debt age changes without a transaction write.

- Treat open debts aged seven days or more as aging debts.
  Reason: The PRD supplies that boundary.

- Do not save debt-age crossings as triggered alerts.
  Reason: FR2 treats debt age as computed information.

## Alert messages

- Provide a prefilled WhatsApp link on each alert.
  Reason: FR4 requires a manual follow-up action.

- Leave sending to the owner after review.
  Reason: The system must not send customer messages automatically.

- Do not automatically push stock or expense alerts to WhatsApp.
  Reason: The Risks section explicitly excludes those pushes.

## Pending assumption

The absence of scheduled alert checks is labelled as an assumption in the PRD.

## Decisions required before affected implementation

- Ask whether low stock alerts use below or at-or-below comparison.
  Reason: The summary and query wording differ, and FR2 does not explicitly settle the alert operator.

- Ask what resolves each saved alert and who may resolve it.
  Reason: Resolution behavior is unspecified.

- Ask whether repeated qualifying writes create additional alerts.
  Reason: Alert deduplication is unspecified.

- Ask how recipients, missing phone numbers, and prefilled messages are determined.
  Reason: FR4 does not provide a complete message contract.