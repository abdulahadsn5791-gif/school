import {
  AttendanceAggregate,
  type AttendanceReadModel,
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { AttendancePersistence } from './attendance.models';

export const AttendanceMapper = {
  persistenceToAggregate(doc: AttendancePersistence): AttendanceAggregate {
    return AttendanceAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.studentId),
      Id.rehydrate(doc.classId),
      doc.subjectId ? Id.rehydrate(doc.subjectId) : null,
      doc.periodId ? Id.rehydrate(doc.periodId) : null,
      doc.date,
      doc.status,
      doc.remark ?? null,
      Id.rehydrate(doc.markedBy),
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(attendance: AttendanceAggregate) {
    return {
      _id: attendance.id.value,
      schoolId: attendance.schoolId.value,
      studentId: attendance.studentId.value,
      classId: attendance.classId.value,
      subjectId: attendance.subjectId?.value ?? null,
      periodId: attendance.periodId?.value ?? null,
      date: attendance.date,
      status: attendance.status,
      remark: attendance.remark,
      markedBy: attendance.markedBy.value,
      deleted: {
        deleted: attendance.deleted.isDeleted,
        at: attendance.deleted.from?.value ?? null,
        by: attendance.deleted.performedBy?.value ?? null,
        reason: attendance.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(attendance: AttendanceAggregate): AttendanceReadModel {
    return {
      id: attendance.id.value,
      schoolId: attendance.schoolId.value,
      studentId: attendance.studentId.value,
      classId: attendance.classId.value,
      subjectId: attendance.subjectId?.value ?? null,
      periodId: attendance.periodId?.value ?? null,
      date: attendance.date,
      status: attendance.status,
      remark: attendance.remark,
      markedBy: attendance.markedBy.value,
      isDeleted: attendance.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: AttendancePersistence): AttendanceReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      studentId: doc.studentId,
      classId: doc.classId,
      subjectId: doc.subjectId ?? null,
      periodId: doc.periodId ?? null,
      date: doc.date,
      status: doc.status,
      remark: doc.remark ?? null,
      markedBy: doc.markedBy,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
