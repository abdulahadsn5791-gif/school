import {
  type IClassRepository,
  Id,
  type IEventBus,
  type IPeriodRepository,
  type ISchoolRepository,
  type ISubjectRepository,
  type ITimetableRepository,
  type IUserRepository,
  Reason,
  TimetableEntryAggregate,
  type TimetableEntryReadModel,
} from '@ecomerece/domain';
import type {
  CreateTimetableEntryType,
  DeleteTimetableEntryType,
  GetTimetableEntriesType,
  UpdateTimetableEntryType,
} from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { TimetableMapper } from '../infra/timetable.mapper';
import { TimetableMessages } from '../presentation/timetable.messages';

export class TimetableAppService {
  constructor(
    private readonly timetableRepo: ITimetableRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
    private readonly classRepo?: IClassRepository,
    private readonly subjectRepo?: ISubjectRepository,
    private readonly periodRepo?: IPeriodRepository,
    private readonly userRepo?: IUserRepository,
  ) {}

  private async publishEvents(entry: TimetableEntryAggregate): Promise<void> {
    const events = entry.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  private async assertRefsExist(
    schoolId: Id,
    classId: Id,
    subjectId: Id,
    teacherId: Id,
    periodId: Id,
  ): Promise<void> {
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }
    if (this.classRepo) {
      const clazz = await this.classRepo.FindByIdOrThrow(classId);
      if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    }
    if (this.subjectRepo) {
      const subject = await this.subjectRepo.FindByIdOrThrow(subjectId);
      if (subject.isDeleted) throw new ConflictError('This subject has been deleted.');
    }
    if (this.periodRepo) {
      await this.periodRepo.FindByIdOrThrow(periodId);
    }
    if (this.userRepo) {
      const teacher = await this.userRepo.FindByIdOrThrow(teacherId);
      if (teacher.deleted.isDeleted) throw new ConflictError('This teacher is not available.');
    }
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
    _actor: { _id: string },
  ): Promise<TimetableEntryReadModel> {
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
    _actor: { _id: string },
  ): Promise<TimetableEntryReadModel> {
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

  async softDelete(data: DeleteTimetableEntryType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const entryId = Id.create(data.timetableEntryId);
    const entry = await this.timetableRepo.FindByIdOrThrow(entryId);
    entry.delete(actorId, Reason.create(data.reason));
    await this.timetableRepo.Save(entry);
    await this.publishEvents(entry);
    return TimetableMessages.delete(entryId, actorId).message;
  }

  async recover(
    timetableEntryId: string,
    _actor: { _id: string },
  ): Promise<TimetableEntryReadModel> {
    const entry = await this.timetableRepo.FindByIdOrThrow(Id.create(timetableEntryId));
    entry.recover();
    await this.timetableRepo.Save(entry);
    await this.publishEvents(entry);
    return TimetableMapper.aggregateToReadModel(entry);
  }
}
