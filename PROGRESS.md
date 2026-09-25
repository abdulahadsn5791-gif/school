# PROGRESS — School Modules Build (handoff)

Date: 2025-09-25. Status: **safe stopping point — workspace fully green.**

## Verification at stop
- `bun run typecheck` → ui 0, web 0, api 0 (all pass)
- `bun run lint:fix` → clean (3 warnings only, no errors)
- `bun test` → 10 pass, 0 fail

## DONE

### 1. All model files (schema spec #0–#16) — `apps/api/modules/<feature>/infra/<feature>.models.ts`
- `school` (0), `academic-term` (0b), `guardian` + `student-guardian` (1b),
  `class` (2), `subject` (3), `period` (4), `enrollment` (5), `timetable` (6),
  `attendance` (7), `assignment` (8), `student-test` (9), `report` (10),
  `fee` (11: FeeStructureModel + InvoiceModel + PaymentModel), `notice` (12),
  `leave` (13), `event` (14, model name CalendarEvent), `session` (15, RefreshToken),
  `audit-log` (16). All follow `user.models.ts` style: `InferSchemaType`,
  `HydratedDocument`, string `_id`, partial unique indexes on `deleted.deleted: false`.
- Shared sub-schemas (deleted/state/name/role/avatar/subjectGrade, DAYS_OF_WEEK)
  live in `apps/api/modules/common/common-schemas.ts`, imported as
  `../../common/common-schemas` from each infra folder (NOT `../common/`).

### 2. Enrollment module — domain + infra + application
- `packages/domain/modules/enrollment/`: aggregate (create/rehydrate, assignClass,
  assignRollNumber(string|null), delete(actor, Reason), recover), 4 events, port
  `IEnrollmentRepository` (incl. `ExistsRoleEnrollment` consumed by UserAppService),
  read model, index.ts barrel.
- `apps/api/modules/enrollment/infra/`: mapper (persistenceToAggregate,
  aggregateToPersistence, aggregateToReadModel, persistenceToReadModel) + repository.
- `apps/api/modules/enrollment/application/enrollment.app.service.ts`:
  createEnrollment (re-enrolls soft-deleted record; unique per student/year),
  updateEnrollment, getEnrollment, softDelete, recover.

### 3. Class module — domain + infra
- `packages/domain/modules/class/`: aggregate (rename, assignClassTeacher, delete,
  recover), 4 events, port `IClassRepository`, read model, barrel.
- `apps/api/modules/class/infra/`: mapper + repository.

### 4. Shared package repairs (pre-existing broken barrels)
- `packages/shared/request-dtos/class/` + `.../enrollment/`: zod DTOs
  (create/update/get/id) with barrels. NOTE: exported names are
  `CreateEnrollmentType` / `UpdateEnrollmentType` etc. (no "Dto" infix).
- `packages/shared/types/class-dto.types.ts` (Class/Enrollment response DTOs),
  `disclaimer-type.ts` (re-exports class types — placeholder for the never-built
  disclaimer feature), `enrollment-dto.types.ts`.
- `packages/frontend/modules/class/` + `.../enrollment/`: http services + barrels.

## NOT DONE (next steps, in order)

1. **Class/enrollment application + presentation layers**:
   `<feature>.messages.ts`, `<feature>.controller.ts` (extends BaseController),
   `<feature>.routes.ts`, `<feature>.module.ts` (DI wiring), register
   `/classes` + `/enrollments` in `apps/api/routes/index.ts`.
2. **Remaining 14 modules full stack**, bottom-up per AGENTS.md — domain
   (aggregate/events/port/read-model) → infra (mapper/repository) → application →
   presentation, then routes registration. Models already exist for:
   school, academic-term, guardian, subject, period, timetable, attendance,
   assignment, student-test, report, fee, notice, leave, event, session, audit-log.
3. Delete-user guard: `ExistsRoleEnrollment` for teachers currently returns false
   always (enrollment repo stub) — implement properly when teacher-class links exist.
4. Route registration for ALL new modules once controllers exist.

## Gotchas learned
- `write_file` needs BOTH `path` + `instructions` + `content` (tool errors otherwise).
- Root tsconfig `paths` has NO `@ecomerece/api` alias — use relative imports
  inside apps/api (I added then reverted an alias; final state = original paths only).
- Mongoose lean docs: `createdAt` is `unknown` → cast/narrow before assigning to Date.
- Id.rehydrate() for anything from DB; Id.create() only server-side new IDs.
- DeleteInfoVO.create(actorId, Reason) — Reason VO, not raw string.
- user.app.service.test.ts mocks IEnrollmentRepository with `ExistsRoleEnrollment`
  — do not rename that port method.
