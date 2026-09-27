import {
  assertRefRole,
  assertSameSchool,
  GetClassesByIdsQuery,
  GetClassSummaryByIdQuery,
  GetPeriodSummaryByIdQuery,
  GetPeriodsByIdsQuery,
  GetSchoolSummaryByIdQuery,
  GetSubjectSummaryByIdQuery,
  GetSubjectsByIdsQuery,
  GetUserSummaryByIdQuery,
  Id,
  type IEventBus,
  type IQueryBus,
  type ITimetableRepository,
  Reason,
  type TeacherTimetableScreenReadModel,
  TimetableEntryAggregate,
  type TimetableEntryReadModel,
} from '@ecomerece/domain';
import type {
  CreateTimetableEntryType,
  DeleteTimetableEntryType,
  GetTimetableEntriesType,
  UpdateTimetableEntryType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { TimetableMapper } from '../infra/timetable.mapper';
import { TimetableMessages } from '../presentation/timetable.messages';

/** Safety cap for the screen query's entry scan (one teacher's week is small). */
const SCREEN_ENTRY_CAP = 500;

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export class TimetableAppService {
  constructor(
    private readonly timetableRepo: ITimetableRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(entry: TimetableEntryAggregate): Promise<void> {
    const events = entry.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  /**
   * Referential existence + INTEGRITY via the QueryBus (infra.md Step 1 + Step 2):
   * every referenced entity must exist, be live, belong to the SAME school, and
   * the teacher must actually be a teacher. Cross-module reads run at public
   * tier, so hidden rows throw NotFoundError here.
   */
  private async assertRefsExist(
    schoolId: Id,
    classId: Id,
    subjectId: Id,
    teacherId: Id,
    periodId: Id,
  ): Promise<void> {
    const [school, clazz, subject, teacher] = await Promise.all([
      this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value)),
      this.queryBus.execute(new GetClassSummaryByIdQuery(classId.value)),
      this.queryBus.execute(new GetSubjectSummaryByIdQuery(subjectId.value)),
      this.queryBus.execute(new GetUserSummaryByIdQuery(teacherId.value)),
    ]);
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    if (subject.isDeleted) throw new ConflictError('This subject has been deleted.');

    // Domain law (new.md §6): same-school coherence + teacher role.
    assertSameSchool(schoolId, [
      { label: 'Class', schoolId: clazz.schoolId },
      { label: 'Subject', schoolId: subject.schoolId },
      { label: 'Period', schoolId: null },
    ]);
    assertRefRole('teacher', teacher, 'teacher');

    const period = await this.queryBus.execute(new GetPeriodSummaryByIdQuery(periodId.value));
    assertSameSchool(schoolId, [{ label: 'Period', schoolId: period.schoolId }]);
  }

  private async assertSlotFree(
    params: {
      schoolId: Id;
      academicYear: string;
      dayOfWeek: TimetableEntryAggregate['dayOfWeek'];
      periodId: Id;
      classId: Id;
      teacherId: Id;
    },
    exceptEntryId?: Id,
  ): Promise<void> {
    const occupant = await this.timetableRepo.FindSlotOccupant({
      ...params,
      exceptEntryId,
    });
    if (!occupant) return;
    if (occupant.classId.equals(params.classId)) {
      throw new ConflictError('This class already has a lesson in this slot.');
    }
    throw new ConflictError('This teacher already has a lesson in this slot.');
  }

  async createEntry(
    data: CreateTimetableEntryType,
    actor: Actor,
  ): Promise<TimetableEntryReadModel> {
    actor.assertAdmin();

    const schoolId = Id.create(data.schoolId);
    const classId = Id.create(data.classId);
    const subjectId = Id.create(data.subjectId);
    const teacherId = Id.create(data.teacherId);
    const periodId = Id.create(data.periodId);

    await this.assertRefsExist(schoolId, classId, subjectId, teacherId, periodId);
    await this.assertSlotFree({
      schoolId,
      academicYear: data.academicYear,
      dayOfWeek: data.dayOfWeek,
      periodId,
      classId,
      teacherId,
    });

    const entry = TimetableEntryAggregate.create({
      id: Id.create(),
      schoolId,
      academicYear: data.academicYear,
      classId,
      subjectId,
      teacherId,
      periodId,
      dayOfWeek: data.dayOfWeek,
    });

    await this.timetableRepo.Create(entry);
    await this.publishEvents(entry);
    return TimetableMapper.aggregateToReadModel(entry);
  }

  async updateEntry(
    data: UpdateTimetableEntryType,
    actor: Actor,
  ): Promise<TimetableEntryReadModel> {
    actor.assertAdmin();

    const entry = await this.timetableRepo.FindByIdOrThrow(Id.create(data.timetableEntryId));
    if (entry.isDeleted) throw new NotFoundError('Timetable entry not found.');

    const subjectId = data.subjectId ? Id.create(data.subjectId) : entry.subjectId;
    const teacherId = data.teacherId ? Id.create(data.teacherId) : entry.teacherId;
    const dayOfWeek = data.dayOfWeek ?? entry.dayOfWeek;
    const periodId = data.periodId ? Id.create(data.periodId) : entry.periodId;

    if (data.subjectId !== undefined || data.teacherId !== undefined) {
      await this.assertRefsExist(entry.schoolId, entry.classId, subjectId, teacherId, periodId);
    }

    const slotChanged =
      data.dayOfWeek !== undefined ||
      data.periodId !== undefined ||
      data.teacherId !== undefined ||
      data.subjectId !== undefined;
    if (slotChanged) {
      await this.assertSlotFree(
        {
          schoolId: entry.schoolId,
          academicYear: entry.academicYear,
          dayOfWeek,
          periodId,
          classId: entry.classId,
          teacherId,
        },
        entry.id,
      );
    }

    entry.reassign(subjectId, teacherId);
    entry.moveTo(dayOfWeek, periodId);

    await this.timetableRepo.Save(entry);
    await this.publishEvents(entry);
    return TimetableMapper.aggregateToReadModel(entry);
  }

  async getEntry(timetableEntryId: string): Promise<TimetableEntryReadModel> {
    const entry = await this.timetableRepo.FindByIdOrThrow(Id.create(timetableEntryId));
    return TimetableMapper.aggregateToReadModel(entry);
  }

  /**
   * The teacher timetable screen (new.md §6): the engine composes exactly what
   * the teacher timetable page renders — slots resolved to display names,
   * grouped by day, ordered by period order — in ONE request. Ids are batched
   * through the QueryBus (`$in` lookups, never N+1); hidden rows read as
   * "Unknown", mirroring the old client join's fallbacks.
   */
  async getTeacherTimetableScreen(actor: Actor): Promise<TeacherTimetableScreenReadModel> {
    actor.assertRole('teacher');

    const entries = await this.timetableRepo.FindByTeacherAllYears(actor.id, SCREEN_ENTRY_CAP);
    if (entries.length === 0) {
      return { schoolId: null, byDay: [], classes: [], totalSlots: 0, isTruncated: false };
    }

    const schoolId = entries[0]?.schoolId.value ?? null;

    const [periods, subjects, classes] = await Promise.all([
      this.queryBus.execute(
        new GetPeriodsByIdsQuery([...new Set(entries.map((e) => e.periodId.value))]),
      ),
      this.queryBus.execute(
        new GetSubjectsByIdsQuery([...new Set(entries.map((e) => e.subjectId.value))]),
      ),
      this.queryBus.execute(
        new GetClassesByIdsQuery([...new Set(entries.map((e) => e.classId.value))]),
      ),
    ]);

    const periodById = new Map(periods.map((period) => [period.id, period]));
    const subjectNameById = new Map(subjects.map((subject) => [subject.id, subject.name]));
    const classNameById = new Map(classes.map((clazz) => [clazz.id, clazz.name]));

    const byDay = WEEK_DAYS.map((day) => ({
      day,
      slots: entries
        .filter((entry) => entry.dayOfWeek === day)
        .map((entry) => {
          const period = periodById.get(entry.periodId.value);
          return {
            entryId: entry.id.value,
            dayOfWeek: day,
            periodId: entry.periodId.value,
            periodName: period?.name ?? 'Unnamed period',
            // Unknown periods sort last rather than jumping to order 0.
            periodOrder: period?.order ?? Number.MAX_SAFE_INTEGER,
            startTime: period?.startTime ?? null,
            endTime: period?.endTime ?? null,
            classId: entry.classId.value,
            className: classNameById.get(entry.classId.value) ?? 'Unknown class',
            subjectName: subjectNameById.get(entry.subjectId.value) ?? 'Unknown subject',
          };
        })
        .sort((a, b) => a.periodOrder - b.periodOrder),
    }));

    // Derived from the entries rather than from the teacher's own classes, because
    // a teacher is timetabled to teach classes they are not the class teacher of.
    const classesMap = new Map<string, string>();
    for (const day of byDay) {
      for (const slot of day.slots) {
        if (!classesMap.has(slot.classId)) classesMap.set(slot.classId, slot.className);
      }
    }
    const screenClasses = [...classesMap.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      schoolId,
      byDay,
      classes: screenClasses,
      totalSlots: byDay.reduce((sum, day) => sum + day.slots.length, 0),
      isTruncated: entries.length >= SCREEN_ENTRY_CAP,
    };
  }

  async listEntries(query: GetTimetableEntriesType): Promise<{
    data: TimetableEntryReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.classId) filter.classId = query.classId;
    if (query.teacherId) filter.teacherId = query.teacherId;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.dayOfWeek) filter.dayOfWeek = query.dayOfWeek;

    const result = await this.timetableRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((entry) => TimetableMapper.aggregateToReadModel(entry)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteTimetableEntryType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const entryId = Id.create(data.timetableEntryId);
    const entry = await this.timetableRepo.FindByIdOrThrow(entryId);
    entry.delete(actorId, Reason.create(data.reason));
    await this.timetableRepo.Save(entry);
    await this.publishEvents(entry);
    return TimetableMessages.delete(entryId, actorId).message;
  }

  async recover(timetableEntryId: string, actor: Actor): Promise<TimetableEntryReadModel> {
    actor.assertAdmin();

    const entry = await this.timetableRepo.FindByIdOrThrow(Id.create(timetableEntryId));
    entry.recover();
    await this.timetableRepo.Save(entry);
    await this.publishEvents(entry);
    return TimetableMapper.aggregateToReadModel(entry);
  }
}
