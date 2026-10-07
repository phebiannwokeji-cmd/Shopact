---
trigger: always_on
---

# Records and Data

Source: `Docs/Shop_Act_PRD.md`, FR1, FR3, and Technical Architecture.
This file owns transaction effects and correction behavior.

## Data contract

- Follow the PRD's data definitions for fields, relationships, and constraints.
  Reason: Additional persistence requirements need an approved decision.

- Associate records with the business required by that contract.
  Reason: Records belong to a specific shop.

- Preserve the actor attribution supplied by the contract.
  Reason: The product must identify who recorded or changed information.

- Ask how debt creation and debt settlement actors are retained.
  Reason: The PRD emphasizes attribution but does not supply those actor fields.

## Money

- Store money as whole-number kobo, never floating-point values.
  Reason: The PRD requires integer currency storage.

- Convert incoming naira amounts to kobo by multiplying by 100.
  Reason: Input amounts and stored amounts use different units.

- Require positive whole-number debt and expense amounts.
  Reason: FR1 explicitly requires those validations.

- Treat a purchase amount as the total cost of the purchased quantity.
  Reason: FR1 does not define it as a unit price.

## Transaction effects

- Require a positive whole-number sale quantity.
  Reason: FR1 defines that constraint.

- Reject a sale above current stock without saving the sale or changing stock.
  Reason: FR1 forbids recording that transaction.

- Reduce stock by the quantity of a successful sale.
  Reason: The sale removes inventory.

- Increase stock by the quantity of a successful purchase.
  Reason: The purchase adds inventory.

- Create an open debt for a successful debt-recording action.
  Reason: Payment recording is a separate action.

- Mark the named customer's oldest open debt paid.
  Reason: FR1 specifies oldest-first settlement.

- Make no debt change when that customer has no open debt.
  Reason: There is no eligible debt to settle.

- Return the remaining open-debt count when debts remain after settlement.
  Reason: The messaging interface needs that count for its reply.

- Reject an expense with an empty note.
  Reason: FR1 requires the note even though the storage field is optional.

- Preserve the supplied expense note as its description.
  Reason: No separate expense categorization is specified.

## Corrections

- Correct entries in place rather than creating offsetting entries.
  Reason: The PRD confirms direct correction.

- Audit the field, old value, new value, actor, and time.
  Reason: FR3 requires those details for each correction.

- Preserve FR3's sequence of recording the audit entry before updating the record.
  Reason: The PRD explicitly describes that sequence.

## Decisions required before affected implementation

- Ask how sale totals are calculated.
  Reason: The sale command contains no amount and the PRD supplies no pricing rule.

- Ask for purchase validation beyond the rules explicitly stated in FR1.
  Reason: Purchase amount and quantity constraints are incomplete.

- Ask how unknown products, unknown customers, duplicate names, and equal-age debts are resolved.
  Reason: Lookup, creation, and tie-breaking behavior are unspecified.

- Ask which fields may be corrected and how corrections affect related records.
  Reason: The PRD does not define editable fields or secondary effects.

- Ask how concurrent writes and partial failures preserve transaction and audit consistency.
  Reason: The PRD specifies outcomes but not failure or concurrency behavior.