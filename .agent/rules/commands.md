---
trigger: always_on
description: Whenever the agents needs to run commands in the code base
---

# Workspace Commands and Configuration

Source: Verified repository scripts, configuration, and the PRD.
This file owns the workspace execution inventory.

## Command records

- Add exact commands only after verifying repository evidence.
  Reason: The stack does not determine script names or package-manager choices.

- Record the working directory for each command.
  Reason: Execution behavior depends on location.

- Record each command's purpose, prerequisites, and side effects.
  Reason: A command may modify files or contact services.

- Identify database access and external-service access for each command.
  Reason: Execution must remain within AGENTS.md permissions.

- Record what each verification command actually checks.
  Reason: A successful build does not prove business behavior.

- Include setup, development, build, type-checking, linting, and test commands when supported.
  Reason: These categories describe the workspace's available execution paths.

- Mark a category unavailable when the repository provides no verified command.
  Reason: Missing verification must remain visible.

- Do not invent scripts to complete the inventory.
  Reason: An inventory records evidence rather than creating tooling requirements.

- Use the owning feature file for expected product outcomes.
  Reason: This file records execution, not another acceptance specification.

## Configuration records

- Keep configuration names and safe placeholders in `.env.example`.
  Reason: Required configuration needs an inspectable inventory.

- Record each variable's purpose, required context, and source.
  Reason: A name alone does not explain when it is needed.

- Use `DATABASE_URL` for the database connection described by the PRD.
  Reason: That is the supplied configuration name.

- Add other names only when supported by approved decisions or verified code.
  Reason: The PRD does not name every integration variable.

- Verify the actual environment-file loading arrangement.
  Reason: A particular local environment filename is not established by the PRD.

## Inventory status

No exact workspace commands are recorded in this file yet.

- Populate the inventory from repository evidence before using it.
  Reason: An empty inventory is not proof that a conventional command is valid.