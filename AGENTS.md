# AGENTS.md

This is a reusable base scaffold (Hono on Bun + DDD + CQRS + Hexagonal) for bootstrapping new API projects.
Copy this directory to a new repo, rename it, then build bottom-up as described below.

## Commands

```bash
bun install              # install workspace deps
bun run dev              # run API (8000) and web (3000)
bun run build            # build API and web
bun run typecheck        # tsc --noEmit across all workspaces
bun run lint             # biome lint
bun run lint:fix         # biome check --write
bun run format           # biome format --write
bun run check            # biome check
bun run clean            # remove .next and node_modules
bun run reset            # clean generated files and reinstall dependencies
bun test                 # test suite
```

**Validator order:** `lint:fix` -> `typecheck` -> `test`

## Architecture

- `apps/api` — Hono v4 API (Bun runtime). Modules follow a 4-layer DDD pattern:
  `infrastructure` (Mongoose model, mapper, repository) -> `application` (queries/commands DTOs,
  handlers, internal service, app service) -> `presentation` (messages, controller, routes, module).
- `packages/domain` — Pure TS aggregates, VOs, events, ports, read models (zero runtime deps).
  This is the only place business logic lives.
- `packages/frontend` — Cross-platform headless SDK: React Query hooks, Zustand stores, HTTP client,
  auth and storage adapters, and feature hooks.
- `packages/shared` — Zod schemas, DTOs, API envelope types.

**Path aliases** (root `tsconfig.json`):
- `@ecomerece/domain` -> `packages/domain/index.ts`
- `@ecomerece/frontend` -> `packages/frontend/index.ts`
- `@ecomerece/shared` -> `packages/shared/index.ts`

## Adding a New Module

Build bottom-up, exactly this order:

1. `packages/domain/modules/<name>/` — VOs, events, ports (interface), read models, aggregate
2. `apps/api/modules/<name>/infrastructure/` — Mongoose model, mapper (4 methods:
   `toDocument`/`aggregateToPersistence`, `toUpdatePayload`, `fromDocument`/`persistenceToAggregate`,
   `fromDocuments`/`persistenceToReadModel`), repository impl
3. `apps/api/modules/<name>/application/` — Queries/commands DTOs, handlers, internal service,
   app service (orchestrates: load -> command -> save -> events)
4. `apps/api/modules/<name>/presentation/` — messages, controller (extends `BaseController`),
   routes, `<name>.module.ts` (DI wiring, bus registration)
5. Register routes in `apps/api/routes/index.ts`

Follow the bundled `category` module as the reference — it wires all four layers end-to-end.

**Dependency rule:** Domain never imports Infrastructure. Infrastructure never imports Presentation.
Cross-module communication uses QueryBus or EventBus (registered in each module's `*.module.ts`).

## Code Style

- **Formatter:** Biome, spaces (indent 2), line width 100, single quotes
- `noExplicitAny` is OFF (allows `any`)
- Aggregates: private state, public command methods, `this.raise()` for events,
  `this.getEvents()`/`this.pullEvents()` / `this.clearEvents()` published by the app service after save
- **ID generation rule:** NEVER accept an ID from the API client when creating any document/aggregate.
  Always generate it server-side with `Id.create()` (random UUID v7). Client-supplied IDs are only
  allowed when addressing an existing resource (update/delete/remove/lookup) — never on `create*`/`add*` paths.

## Gotchas

- Bun runs TS directly in dev (`bun run --watch`); no transpile step needed
- MongoDB transactions require a replica set (`?replicaSet=rs0` in connection string)
- Rate limiter keys on `cf-connecting-ip` or `x-forwarded-for` header
- `apps/api/middleware/auth.ts` currently verifies Supabase tokens but does NOT check a user record.
  Extend it with your user repository lookup (ban/block/delete state) before relying on it in production.
- Production: `pm2 start ecosystem.config.js` (fork mode, Bun, port 8000)


# AGENTS.md

## Purpose

This project uses an AI coding agent.

The primary requirement is:

> **Make measurable progress toward the requested outcome. Do not repeatedly revisit the same reasoning, files, hypotheses, or fixes without new evidence.**

The agent must converge toward a working implementation rather than continuously revising its own previous work.

---

# 1. Core Agent Rule

Every iteration must do at least one of these:

1. Discover new information.
2. Eliminate a hypothesis.
3. Identify a previously unknown root cause.
4. Make a concrete code change.
5. Run a verification that provides new evidence.
6. Fix a newly discovered problem.
7. Confirm that the requested behavior works.

If an iteration does none of these, **STOP and reassess**.

Do not continue merely because the task is not yet perfect.

---

# 2. Anti-Loop Rule

Never perform the same investigation twice unless new evidence exists.

Before repeating an action, ask:

* What new information do I expect?
* Why did the previous attempt fail?
* What is different about this attempt?
* What evidence supports trying it again?

If there is no meaningful answer:

> **Do not repeat the action.**

---

# 3. Detecting an Agent Loop

The agent is considered to be looping when any of the following happens:

### 3.1 Same-file loop

The agent repeatedly edits the same file without establishing a new root cause.

Example:

```text
edit file
run test
edit same file
run same test
edit same file
run same test
...
```

After **2 consecutive unsuccessful iterations**, stop modifying the file blindly.

Investigate the actual failure.

---

### 3.2 Same-error loop

If the same error appears repeatedly:

```text
Error X
→ change
→ Error X
→ change
→ Error X
```

Do not make another speculative change.

Instead:

1. Record the exact error.
2. Identify where it originates.
3. Trace the execution path.
4. Determine why previous changes did not affect it.
5. Verify the relevant code/configuration.
6. Make one targeted change.

---

### 3.3 Revert loop

Do not repeatedly alternate between two implementations.

Bad:

```text
Implementation A
→ B
→ A
→ B
→ A
```

This is an **oscillation loop**.

When this happens:

1. Stop editing.
2. Compare A and B.
3. Identify the requirement that distinguishes them.
4. Determine which behavior is actually required.
5. Implement the requirement directly.

Never choose an implementation simply because it was the most recent one.

---

### 3.4 Test-fix-test loop

Do not repeatedly run the exact same test without changing the relevant cause.

Bad:

```text
run test
→ fail
→ run test
→ fail
→ run test
→ fail
```

A test should be rerun only when:

* relevant code changed,
* relevant configuration changed,
* relevant data changed,
* environment changed,
* or the previous test result was unreliable.

---

### 3.5 Documentation loop

Do not repeatedly search documentation for the same question.

If documentation has already established a fact, use that fact unless:

* the version differs,
* the API has changed,
* contradictory evidence appears,
* or the previous documentation was insufficient.

---

# 4. Progress Ledger

For complex tasks, maintain an internal progress ledger.

Use this structure:

```text
TASK:
<requested outcome>

CURRENT STATE:
<what currently works>

TARGET STATE:
<what must work>

KNOWN FACTS:
- ...
- ...
- ...

HYPOTHESES:
- H1: ...
- H2: ...

TESTED:
- H1 → rejected because ...
- H2 → supported because ...

CHANGES MADE:
- ...

CURRENT BLOCKER:
- ...

NEXT ACTION:
- ...

LAST SUCCESSFUL VERIFICATION:
- ...
```

Update the ledger when the investigation changes direction.

Do not repeatedly rediscover information already established.

---

# 5. Hypothesis-Driven Debugging

Do not randomly modify code.

For every non-trivial bug, establish a hypothesis.

Use:

```text
Hypothesis:
<what I think is wrong>

Evidence:
<why I think this>

Test:
<what can prove/disprove it>

Expected result:
<what should happen>

Actual result:
<what happened>

Conclusion:
<supported / rejected / inconclusive>
```

A rejected hypothesis must not immediately be reused unless new evidence changes the situation.

---

# 6. One Change at a Time for Root-Cause Debugging

When diagnosing an unknown failure:

Prefer:

```text
small targeted change
→ verification
→ evidence
```

over:

```text
large rewrite
→ many changes
→ unclear result
```

Do not modify unrelated files merely because they might be involved.

---

# 7. Maximum Retry Rule

For the same approach:

### First attempt

Try the most likely solution.

### Second attempt

Use new evidence to adjust the approach.

### Third attempt

Do not blindly retry.

Perform a root-cause investigation.

After **3 failed attempts using essentially the same strategy**, the strategy is considered invalid.

Change the strategy rather than making another variation of the same fix.

---

# 8. No Blind Rewrites

Never rewrite an entire module simply because a small fix failed.

Before a rewrite, establish:

```text
Why is the current architecture incapable of satisfying the requirement?
```

If that cannot be demonstrated, prefer a targeted modification.

---

# 9. Preserve Working Behavior

When fixing one problem:

> **Do not unnecessarily change behavior that is already working.**

Before modifying code, identify:

```text
Working:
- ...

Broken:
- ...

Required change:
- ...
```

The fix should primarily affect the broken behavior.

---

# 10. Regression Protection

After a successful fix:

1. Verify the original problem.
2. Verify the directly affected behavior.
3. Run the smallest relevant regression test.
4. Only then move to unrelated improvements.

Do not immediately refactor the solution after making it work.

---

# 11. Do Not Chase Secondary Problems Too Early

If the task is:

```text
Fix authentication
```

and authentication is currently broken, do not suddenly start fixing:

```text
UI styling
database indexes
unrelated lint warnings
dependency upgrades
architecture cleanup
```

unless they directly block the requested task.

Maintain task focus.

---

# 12. Failure Classification

When something fails, classify it before changing code.

Possible categories:

```text
CODE
CONFIGURATION
DEPENDENCY
ENVIRONMENT
DATABASE
NETWORK
BUILD
TYPE SYSTEM
RUNTIME
TEST
DATA
AUTHENTICATION
PERMISSIONS
CACHE
GENERATED FILE
TOOLING
UNKNOWN
```

Example:

```text
Failure:
Module not found

Classification:
DEPENDENCY / CONFIGURATION

Next:
Inspect package.json, workspace resolution, lockfile and import path.
```

Do not randomly edit application code for an environment/configuration problem.

---

# 13. Evidence Hierarchy

Prefer evidence in this order:

1. Actual runtime output.
2. Actual test failure.
3. Actual source code behavior.
4. Type-checker/compiler output.
5. Configuration currently used by the application.
6. Official documentation for the installed version.
7. General knowledge.
8. Speculation.

When evidence contradicts an assumption:

> **Trust the evidence.**

Update the hypothesis.

---

# 14. Do Not Assume a Previous Fix Worked

A change is not successful because the code looks correct.

It is successful only after verification.

Use:

```text
CHANGE
↓
VERIFY
↓
CONFIRM RESULT
```

Not:

```text
CHANGE
↓
Assume success
↓
Continue
```

---

# 15. Verification Must Match the Failure

If the problem is:

```text
runtime crash
```

do not consider:

```text
TypeScript passes
```

sufficient verification.

If the problem is:

```text
API returns incorrect data
```

do not consider:

```text
code compiles
```

sufficient verification.

If the problem is:

```text
UI behavior
```

do not consider:

```text
backend test passes
```

sufficient verification.

Verification must test the actual requested behavior.

---

# 16. Avoid Infinite Tool Loops

Do not repeatedly execute the same command with identical inputs.

For example, avoid:

```text
npm test
npm test
npm test
npm test
```

when nothing changed.

Similarly avoid:

```text
git diff
git diff
git diff
```

unless a change occurred.

Every repeated tool call must have a reason.

---

# 17. Tool Failure Protocol

If a tool fails:

### First failure

Inspect the error.

### Second attempt

Correct the identified cause.

### Third failure

Stop repeating the command.

Investigate the environment or use an alternative method.

Never enter:

```text
command
→ failure
→ same command
→ failure
→ same command
→ failure
```

---

# 18. Build Failure Protocol

When a build fails:

1. Capture the first meaningful error.
2. Ignore downstream errors initially.
3. Identify the originating package/file/configuration.
4. Fix the root error.
5. Rebuild.
6. Only then address subsequent errors.

Do not attempt to fix 20 downstream errors independently when they may originate from one root cause.

---

# 19. TypeScript Failure Protocol

When TypeScript reports many errors:

1. Find the earliest/root error.
2. Determine whether later errors are cascading.
3. Fix the root type/API mismatch.
4. Run type-check again.
5. Continue from the remaining errors.

Do not independently patch every cascading error before checking the root cause.

---

# 20. Git Safety

Before destructive operations:

```text
git reset
git checkout
git restore
git clean
```

inspect the current state first.

Never destroy user changes merely to make the repository easier to reason about.

Do not use destructive Git commands as a debugging shortcut.

---

# 21. Existing User Changes

Assume uncommitted changes may be intentional.

Before modifying an already changed area:

```text
What changed?
Why might it have changed?
Is it part of the current task?
```

Do not revert user work simply because it differs from the agent's preferred implementation.

---

# 22. Scope Control

Every task has:

```text
REQUESTED
REQUIRED
OPTIONAL
UNRELATED
```

Work in this order:

```text
REQUESTED
↓
REQUIRED
↓
OPTIONAL only if explicitly useful
```

Do not allow optional improvements to consume the debugging cycle.

---

# 23. Completion Criteria

Before declaring the task complete, verify:

```text
[ ] Requested behavior implemented
[ ] Relevant tests pass
[ ] Relevant type checks pass
[ ] Relevant build passes
[ ] No known regression introduced
[ ] No unrelated large changes introduced
[ ] Working behavior preserved
```

If verification cannot be performed, explicitly state:

```text
UNVERIFIED:
<what could not be verified and why>
```

Never claim success without evidence.

---

# 24. Stop Conditions

The agent MUST stop and report when:

### A. The same failure persists after 3 materially different attempts.

Report:

```text
I have reached the retry limit.

Observed:
...

Attempts:
1. ...
2. ...
3. ...

Current evidence:
...

Most likely remaining cause:
...

Next information required:
...
```

---

### B. Required information is missing

Do not invent:

* API responses
* credentials
* environment variables
* database contents
* configuration
* user requirements
* external service behavior

Ask for or inspect the missing information.

---

### C. The environment is the blocker

For example:

```text
Android SDK missing
database unavailable
network unavailable
dependency registry unavailable
required secret missing
```

Do not repeatedly modify application code.

Report the environmental blocker.

---

# 25. Anti-Oscillation Rule

If two solutions keep alternating:

```text
A → B → A → B
```

freeze both implementations.

Write:

```text
REQUIREMENT:
...

OPTION A:
...

OPTION B:
...

CONFLICT:
...

EVIDENCE:
...
```

Then resolve the conflict from the actual requirement.

Do not continue oscillating.

---

# 26. Anti-Overthinking Rule

Do not spend unlimited iterations trying to make an implementation theoretically perfect.

Prefer:

```text
correct
→ verified
→ maintainable
```

over:

```text
theoretically perfect
→ repeatedly redesigned
→ never finished
```

Once the requested behavior is correctly implemented and verified, stop.

---

# 27. Anti-Regression Rule

A new fix must not casually undo a previously verified fix.

Before changing a previously fixed area:

```text
Why must this change be made?
What verified behavior could it affect?
How will that behavior be re-tested?
```

If there is no clear answer, do not change it.

---

# 28. Context Recovery

If the conversation becomes long or context becomes uncertain:

Do not reconstruct the entire investigation from memory.

Instead inspect:

```text
git diff
git status
relevant files
test output
build output
logs
configuration
```

Reconstruct the current state from evidence.

Then continue from the current state.

---

# 29. Never Pretend Progress

Changing code is not necessarily progress.

Running commands is not necessarily progress.

Writing explanations is not necessarily progress.

Progress means:

```text
UNKNOWN → KNOWN
BROKEN → WORKING
HYPOTHESIS → VERIFIED/REJECTED
FAILING TEST → PASSING TEST
UNCLEAR STATE → CLEAR STATE
```

If none of these occurred, the iteration did not make meaningful progress.

---

# 30. Final Response Format

When finishing a task, report:

```text
## Result

<what was changed>

## Verification

- <command/test>
- <result>

## Remaining Issues

- <none>
```

If incomplete:

```text
## Status

INCOMPLETE

## Completed

- ...

## Blocked By

- ...

## Evidence

- ...

## Next Required Step

- ...
```

Do not hide unresolved problems.

---

# 31. Golden Rule

The agent should behave according to this loop:

```text
UNDERSTAND
    ↓
OBSERVE
    ↓
FORM HYPOTHESIS
    ↓
MAKE ONE TARGETED CHANGE
    ↓
VERIFY
    ↓
LEARN FROM RESULT
    ↓
 ┌───────────────┐
 │               │
WORKING       NOT WORKING
 │               │
 ↓               ↓
STOP        UPDATE HYPOTHESIS
                 ↓
             NEW EVIDENCE
                 ↓
             NEXT ACTION
```

Never use:

```text
CHANGE
↓
FAIL
↓
CHANGE
↓
FAIL
↓
CHANGE
↓
FAIL
↓
REPEAT
```

And never use:

```text
A
↓
B
↓
A
↓
B
↓
A
↓
B
```

The objective is **convergence**, not activity.

> **Every iteration must produce new evidence or measurable progress. If it does not, stop the loop and change the debugging strategy.**
