# Shopact

## Description

Shopact is a record-keeping tool for Nigerian micro-retail shop owners.
Owners and staff record transactions through fixed-format WhatsApp commands.
An owner-only dashboard supports review, corrections, and action on alerts.

## Who uses it

The product has owner and staff roles.
Their permissions are defined in `.agent/rules/access-and-lifecycle.md`.

## One thing that the agent must do well

Preserve record correctness.
Reason: Incorrect records recreate the problem Shopact exists to solve.

## Defined Scope for the MVP

Use the Scope and Functional Requirements sections of `Docs/Shop_Act_PRD.md`.
Reason: The rules files must not replace or expand approved product scope.

## Not in scope items for the MVP

Do not build excluded or future features without explicit user approval.
Reason: Mentioning a feature does not authorize implementing it.

## Stack

The fixed stack is Next.js, TypeScript, Prisma, PostgreSQL, and Gemini Free tier.

Do not substitute or extend the stack without user approval.
Reason: These choices were fixed by the user.

## Folder map

Use `.agent/rules/architechture.md` for the application source map.
Reason: One source map prevents conflicting folder instructions.

## How to work in this codebase

- Use Shopact as the product name and the PRD for product facts.
  Reason: The user renamed the product described by the PRD.

- Apply explicit user decisions before derived rules.
  Reason: Rules files cannot override the user's instructions.

- Read the relevant PRD sections and rules before changing a feature.
  Reason: This file contains boundaries, not the full specification.

- Load only rules relevant to the current task.
  Reason: Unrelated context creates unnecessary noise.

- Stop affected work when a required source is missing, empty, or contradictory.
  Reason: Missing instructions do not authorize a guess.

- Make one requested change at a time.
  Reason: Unrelated changes make review harder.

- Ask before adding packages.
  Reason: Dependency choices require user approval.

- Do not run database operations or change database structure.
  Reason: The user prohibited the coding agent from touching the database.

- Do not create or alter database schema or migration files without approval.
  Reason: Those files can authorize later structural changes.

- Report and stop work that requires prohibited database access.
  Reason: Product requirements do not grant execution permission.

- Ask before implementing behavior that the PRD leaves unspecified.
  Reason: The agent must not invent product decisions.

- Treat an assumption as confirmed only when the PRD or user explicitly confirms it.
  Reason: An assumption label alone is not approval.

- Check later confirmations before treating a PRD assumption as unresolved.
  Reason: The Assumptions Log confirms some earlier assumptions.

- Preserve existing user changes and stage only task-related changes.
  Reason: Other changes may belong to separate work.

- Commit or push only with user authorization.
  Reason: Those actions change project history or shared state.

- Ask before discarding changes or rewriting history.
  Reason: Those actions can destroy work.

- Ask before reading or changing files containing actual secrets.
  Reason: Secret access requires authorization.

- Never expose secrets in responses, logs, documentation, or commits.
  Reason: Those surfaces can disclose credentials.

- Report checks run, their results, and any blocked checks.
  Reason: The user must distinguish verified work from unverified work.

- End each response with an assumptions list.
  Reason: Uncertainty must remain visible.

- Write "Assumptions: None." when none were made.
  Reason: The report must not imply hidden assumptions.

- Keep this file under 180 lines and keep review reports outside it.
  Reason: It loads in every session.

## Where the detailed rules live

All paths below are relative to the project root.

- `.agent/rules/architechture.md`: Application structure.
- `.agent/rules/commands.md`: Workspace commands and configuration inventory.
- `.agent/rules/records-and-data.md`: Transaction and correction behavior.
- `.agent/rules/whatsapp.md`: Command interface and messaging transport.
- `.agent/rules/alerts-and-dashboard.md`: Dashboard and alert behavior.
- `.agent/rules/access-and-lifecycle.md`: Identity, permissions, and business lifecycle.
- `.agent/rules/pilot-and-evaluation.md`: Commercial and measurement requirements.

Keep each detailed requirement in its owning file.
Reason: Repeated rules can drift into conflicting versions.

Keep unresolved product decisions in the PRD's Open Questions section.
Reason: The project needs one authoritative decision record.

## Definitions

The PRD uses record to mean a saved business entry.
Purchase means stock coming in.
Tier and chunk have no supplied product definitions.

Ask before using an undefined term to determine product behavior.
Reason: Familiar meanings must not become invented requirements.