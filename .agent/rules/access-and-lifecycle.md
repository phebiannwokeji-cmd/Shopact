---
trigger: always_on
---

# Access and Business Lifecycle

Source: `Docs/Shop_Act_PRD.md`, FR3, FR5, FR6, FR7, and Technical Architecture.
This file owns identity, permissions, authentication, suspension, and export.

## Identity and permissions

- Provide owner and staff roles.
  Reason: These are the two PRD roles.

- Allow staff to record sales, purchases, expenses, and debts through WhatsApp.
  Reason: FR5 grants those actions.

- Allow staff to mark debts paid through WhatsApp.
  Reason: FR5 grants payment recording.

- Deny staff dashboard access, past-record editing, deletion, and settings changes.
  Reason: FR5 explicitly excludes those permissions.

- Provide export and reactivation to the owner, not staff.
  Reason: FR7 reserves those paths for the owner.

- Enforce roles at the database layer as required application behavior.
  Reason: The PRD requires enforcement beyond interface visibility.

## Authentication

- Authenticate the dashboard owner by phone number and PIN.
  Reason: Technical Architecture confirms that method.

- Have the owner set the PIN during onboarding.
  Reason: The PRD specifies who sets it and when.

- Verify the PIN against its stored hash.
  Reason: The PRD specifies hashed verification.

- Do not provide staff dashboard credentials.
  Reason: Staff have no dashboard login.

## Activity and suspension

- Apply the PRD's three-month inactivity condition.
  Reason: FR7 defines the suspension period.

- Check inactivity before processing each inbound command or dashboard request.
  Reason: Suspension must precede normal processing.

- Set suspension only when the condition is met and the business is not already suspended.
  Reason: FR7 explicitly includes the existing suspension state.

- Stop normal processing when the request triggers suspension.
  Reason: FR7 requires that request to stop.

- Update activity for successful WhatsApp commands and dashboard actions, excluding export.
  Reason: FR7 defines those activity signals and the export exception.

- Reply to suspended commands: `This shop's records have been paused after 3 months of no activity. Log in to the dashboard to reactivate.`
  Reason: FR7 supplies this fixed response.

- Redirect suspended access to normal dashboard views to the suspension screen after login.
  Reason: Normal records remain inaccessible.

- Keep reactivation and export reachable from that screen.
  Reason: A blanket redirect must not block FR7's required actions.

## Reactivation and retention

- Clear suspension and reset activity after successful reactivation.
  Reason: FR7 specifies that resulting state.

- Never automatically delete a business's records.
  Reason: The PRD requires indefinite retention.

## Export

- Use one export function from active settings and the suspension screen.
  Reason: FR3 and FR7 require the same export behavior.

- Permit suspended export without reactivation.
  Reason: FR7 explicitly preserves that access.

- Include every business record in each of the six export categories.
  Reason: FR7 requires complete coverage.

- Produce one CSV file each for sales, purchases, expenses, debts, customers, and products.
  Reason: FR7 specifies these categories.

- Generate export synchronously from the persisted application records.
  Reason: FR7 excludes a background export job.

- Leave activity and suspension unchanged after export.
  Reason: Export is neither activity nor reactivation.

## Pending assumptions

The PRD marks these decisions as assumptions:

- One receiving business number with identity matched from personal sender numbers.
- No scheduled suspension checks.
- Login followed by deliberate confirmation for reactivation.

## Decisions required before affected implementation

- Ask how businesses, owners, staff, and unknown sender numbers are provisioned or rejected.
  Reason: The complete identity setup flow is missing.

- Ask how PIN recovery and sessions work.
  Reason: Those authentication details are unspecified.

- Ask how calendar months and successful commands are interpreted for activity.
  Reason: FR7 does not define date arithmetic or all command outcome classifications.

- Ask which export columns and download packaging are required.
  Reason: FR7 defines file categories but not those details.