import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
  TimetableEntryAggregate,
  type TimetableEntryReadModel,
} from '@ecomerece/domain';
import type { TimetablePersistence } from './timetable.models';

export const TimetableMapper = {
  persistenceToAggregate(doc: TimetablePersistence): TimetableEntryAggregate {
    return TimetableEntryAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.academicYear,
      Id.rehydrate(doc.classId),
      Id.rehydrate(doc.subjectId),
      Id.rehydrate(doc.teacherId),
      Id.rehydrate(doc.periodId),
      doc.dayOfWeek,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(entry: TimetableEntryAggregate) {
    return {
      _id: entry.id.value,
      schoolId: entry.schoolId.value,
      academicYear: entry.academicYear,
      classId: entry.classId.value,
      subjectId: entry.subjectId.value,
      teacherId: entry.teacherId.value,
      periodId: entry.periodId.value,
      dayOfWeek: entry.dayOfWeek,
      deleted: {
        deleted: entry.deleted.isDeleted,
        at: entry.deleted.from?.value ?? null,
        by: entry.deleted.performedBy?.value ?? null,
        reason: entry.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(entry: TimetableEntryAggregate): TimetableEntryReadModel {
    return {
      id: entry.id.value,
      schoolId: entry.schoolId.value,
      academicYear: entry.academicYear,
      classId: entry.classId.value,
      subjectId: entry.subjectId.value,
      teacherId: entry.teacherId.value,
      periodId: entry.periodId.value,
      dayOfWeek: entry.dayOfWeek,
      isDeleted: entry.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: TimetablePersistence): TimetableEntryReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      academicYear: doc.academicYear,
      classId: doc.classId,
      subjectId: doc.subjectId,
      teacherId: doc.teacherId,
      periodId: doc.periodId,
      dayOfWeek: doc.dayOfWeek,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
