---
trigger: model_decision
description: read before changing commercial decisions or evaluation definitions.
---

# Pilot and Evaluation

Source: `Docs/Shop_Act_PRD.md`, Goals, Business Model, and Success Metrics.
This file owns commercial decisions and evaluation definitions.

## Commercial arrangement

- Run the initial test free for one month.
  Reason: The PRD confirms that arrangement.

- Decide whether to charge after reviewing the test results.
  Reason: Charging is conditional.

- If charging is approved, use ₦5,000 per month per business account.
  Reason: The PRD resolves its per-user wording to one subscription per shop.

- Obtain approval before adding billing functionality.
  Reason: Commercial terms do not define a collection workflow.

## Timing measures

- Measure the full recording journey from opening WhatsApp to confirmation against the under-ten-second goal.
  Reason: Goals defines that user journey.

- Measure median `/owa` and `/sold` reply latency from message receipt to reply sending against the under-three-second target.
  Reason: Success Metrics defines a different timing interval.

## Success measures

- Measure WhatsApp's share of all recorded sales, purchases, and expenses.
  Reason: This tests whether WhatsApp is the main recording channel.

- Use above 80 percent as that share's target.
  Reason: The PRD supplies that target.

- Measure week-three command activity for businesses that sent a command in week one.
  Reason: The PRD uses this to evaluate habit retention.

- Measure the percentage of debts marked paid within 30 days of recording.
  Reason: This is the specified repayment measure.

- Measure the percentage of low stock alerts followed by a matching `/bought` entry within 48 hours.
  Reason: This is the specified follow-through measure.

- Measure the ratio of UNRECOGNIZED to PARSED messages weekly.
  Reason: The PRD uses this to identify command-format friction.

- Evaluate the metrics together at the end of the test.
  Reason: No individual metric is a standalone pass or fail condition.

- Do not assign targets to metrics without a supplied target.
  Reason: A measurement definition does not imply a threshold.

## Pending commercial assumptions

The PRD labels no transaction fees and no MVP feature gating as assumptions.

## Decisions required before affected implementation

- Ask how the overall test period relates to each business's signup date.
  Reason: The PRD does not fully define cohort timing.

- Ask what counts as an active business in the retention measure.
  Reason: The metric uses that term without a complete inclusion rule.

- Ask how alerts are matched to purchases.
  Reason: The matching and attribution rule is unspecified.

- Ask how empty denominators and incomplete observation windows are handled.
  Reason: Those cases affect the reported percentages.

- Ask how corrections affect historical measurements.
  Reason: The PRD does not define whether metrics are recalculated.

- Obtain approval for measurement collection and instrumentation.
  Reason: The PRD defines metrics but not their collection implementation.

- Do not infer an analytics dashboard from these measurement requirements.
  Reason: The specified dashboard scope does not include one.