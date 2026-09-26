import type { AttendanceAggregate, IAttendanceRepository, Id } from '@ecomerece/domain';
import { AttendanceAggregate as AttendanceAggregateClass } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { AttendanceMapper } from './attendance.mapper';
import { AttendanceModel, type AttendancePersistence } from './attendance.models';

export class AttendanceRepository
  extends MongoRepository<AttendancePersistence>
  implements IAttendanceRepository
{
  constructor() {
    super(AttendanceModel);
  }

  async FindById(id: Id): Promise<AttendanceAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return AttendanceMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<AttendanceAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Attendance record not found.');
    return AttendanceMapper.persistenceToAggregate(doc);
  }

  async FindByStudentAndDateRange(
    studentId: Id,
    fromDate: Date,
    toDate: Date,
  ): Promise<AttendanceAggregate[]> {
    const docs = await super.find({
      studentId: studentId.value,
      date: {
        $gte: AttendanceAggregateClass.normalizeDate(fromDate),
        $lte: AttendanceAggregateClass.normalizeDate(toDate),
      },
    });
    return docs.map((doc) => AttendanceMapper.persistenceToAggregate(doc));
  }

  async FindByClassAndDate(classId: Id, date: Date): Promise<AttendanceAggregate[]> {
    const docs = await super.find({
      classId: classId.value,
      date: AttendanceAggregateClass.normalizeDate(date),
    });
    return docs.map((doc) => AttendanceMapper.persistenceToAggregate(doc));
  }

  async FindByStudentAndDate(
    studentId: Id,
    date: Date,
    periodId?: Id,
  ): Promise<AttendanceAggregate | null> {
    const filter: FilterQuery<AttendancePersistence> = {
      studentId: studentId.value,
      date: AttendanceAggregateClass.normalizeDate(date),
    };
    if (periodId) filter.periodId = periodId.value;
    const doc = await super.findOne(filter);
    if (!doc) return null;
    return AttendanceMapper.persistenceToAggregate(doc);
  }

  async Save(attendance: AttendanceAggregate): Promise<void> {
    const { _id, ...data } = AttendanceMapper.aggregateToPersistence(attendance);
    await AttendanceModel.updateOne({ _id }, { $set: data });
  }

  async Create(attendance: AttendanceAggregate): Promise<void> {
    const doc = new AttendanceModel(AttendanceMapper.aggregateToPersistence(attendance));
    await doc.save({ session: this.session });
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }
}
