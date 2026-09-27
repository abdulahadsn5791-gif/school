import type {
  DayOfWeek,
  Id,
  ITimetableRepository,
  TimetableEntryAggregate,
} from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { TimetableMapper } from './timetable.mapper';
import { TimetableModel, type TimetablePersistence } from './timetable.models';

export class TimetableRepository
  extends MongoRepository<TimetablePersistence>
  implements ITimetableRepository
{
  constructor() {
    super(TimetableModel);
  }

  async FindById(id: Id): Promise<TimetableEntryAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return TimetableMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<TimetableEntryAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Timetable entry not found.');
    return TimetableMapper.persistenceToAggregate(doc);
  }

  async FindByClass(
    schoolId: Id,
    classId: Id,
    academicYear: string,
  ): Promise<TimetableEntryAggregate[]> {
    const docs = await super.find({
      schoolId: schoolId.value,
      classId: classId.value,
      academicYear,
    });
    return docs.map((doc) => TimetableMapper.persistenceToAggregate(doc));
  }

  async FindByTeacher(
    schoolId: Id,
    teacherId: Id,
    academicYear: string,
  ): Promise<TimetableEntryAggregate[]> {
    const docs = await super.find({
      schoolId: schoolId.value,
      teacherId: teacherId.value,
      academicYear,
    });
    return docs.map((doc) => TimetableMapper.persistenceToAggregate(doc));
  }

  async FindByTeacherAllYears(teacherId: Id, limit?: number): Promise<TimetableEntryAggregate[]> {
    const query = this.model
      .find({
        teacherId: teacherId.value,
        'deleted.deleted': false,
      })
      .sort({ createdAt: -1, _id: -1 })
      .session(this.session ?? null)
      .lean();
    if (limit !== undefined) query.limit(limit);
    const docs = (await query) as TimetablePersistence[];
    return docs.map((doc) => TimetableMapper.persistenceToAggregate(doc));
  }

  async FindSlotOccupant(params: {
    schoolId: Id;
    academicYear: string;
    dayOfWeek: DayOfWeek;
    periodId: Id;
    classId?: Id;
    teacherId?: Id;
    exceptEntryId?: Id;
  }): Promise<TimetableEntryAggregate | null> {
    const base: FilterQuery<TimetablePersistence> = {
      schoolId: params.schoolId.value,
      academicYear: params.academicYear,
      dayOfWeek: params.dayOfWeek,
      periodId: params.periodId.value,
      'deleted.deleted': false,
    };
    if (params.exceptEntryId) base._id = { $ne: params.exceptEntryId.value };

    const or: FilterQuery<TimetablePersistence>[] = [];
    if (params.classId) or.push({ classId: params.classId.value });
    if (params.teacherId) or.push({ teacherId: params.teacherId.value });
    if (or.length === 0) return null;

    const doc = await super.findOne({ ...base, $or: or });
    if (!doc) return null;
    return TimetableMapper.persistenceToAggregate(doc);
  }

  async Save(entry: TimetableEntryAggregate): Promise<void> {
    const { _id, ...data } = TimetableMapper.aggregateToPersistence(entry);
    await TimetableModel.updateOne({ _id }, { $set: data });
  }

  async Create(entry: TimetableEntryAggregate): Promise<void> {
    const doc = new TimetableModel(TimetableMapper.aggregateToPersistence(entry));
    await doc.save({ session: this.session });
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: TimetableEntryAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<TimetablePersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        TimetableMapper.persistenceToAggregate(doc as TimetablePersistence),
      ),
      meta: result.meta,
    };
  }
}
