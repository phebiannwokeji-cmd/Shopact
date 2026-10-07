---
name: shopact-cross-interface-regression-review
description: Review Shopact transaction changes for regressions across WhatsApp, the dashboard, and shared services. Use after transaction logic or its callers change. Produce evidence and findings without implementing fixes.
---

1. Identify the change under review.
   Record the requested change, changed files, and comparison baseline.
   Ask for the review target if none is identifiable.
   If no baseline exists, mark regression attribution unavailable.

2. Read the project root AGENTS.md and the affected sections of Docs/Shop_Act_PRD.md.
   Read these files from .agent/rules/:
   - architechture.md
   - records-and-data.md
   - whatsapp.md
   - commands.md

   Read alerts-and-dashboard.md when effects involve alerts or settings.
   Read access-and-lifecycle.md when effects involve identity, permissions, activity, or suspension.
   Record missing or empty sources and stop the affected review.

3. Identify the affected transaction actions.
   Separate confirmed requirements from unresolved decisions.
   List unresolved cases as blocked.
   Continue only with cases whose expected behavior is defined.

4. Trace each affected action from its implemented WhatsApp and dashboard callers.
   Record the caller, shared service entry, and persistence boundary using file and line references.
   Mark a required but absent caller as missing.
   Do not invent a caller for an unspecified interface action.

5. Build a case table from the owning rules.
   Select relevant success, rejection, permission, and side-effect cases.
   Record each case's source section, input, starting state, actor, and expected outcome.
   Compare equivalent actions and starting states across applicable interfaces.
   Cite any required differences instead of treating all interface differences as defects.

6. Inspect the changed implementation and existing tests for each case.
   Record which expected effects the code and tests address.
   Identify missing assertions and paths with no test coverage.
   Keep code inspection separate from executed test evidence.

7. Select checks from the verified inventory in commands.md.
   Inspect their prerequisites and side effects against AGENTS.md permissions.
   Mark a check blocked if its command is unverified, its prerequisites are absent, or its effects are prohibited.
   Record the blocking reason without inventing a replacement command.

8. Run the selected permitted checks.
   Record the exact command, outcome, and relevant output.
   Map each result to the cases it actually exercises.
   Leave cases unverified when the check does not demonstrate their expected outcome.

9. Compare the collected evidence with each case's expected outcome.
   Mark a case verified only when executed evidence demonstrates that outcome.
   Mark it failed when code or execution establishes a requirement violation.
   Label the evidence type for each failure.
   Mark all remaining cases unverified and state the reason.
   Attribute a failure to the change only when the baseline comparison supports that conclusion.

10. Return the review.
    Include the reviewed files and baseline.
    Include a table with case, requirement source, interfaces reviewed, evidence, and status.
    List actionable findings with file and line references, the violated requirement, and the observed consequence.
    List blocked checks and unresolved decisions separately.
    End with the assumptions report required by AGENTS.md.
    Finish when every selected case has a status and evidence or an explicit gap.