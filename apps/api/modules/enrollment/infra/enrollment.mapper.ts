import {
  DeleteInfoVO,
  EffectiveDate,
  EnrollmentAggregate,
  type EnrollmentReadModel,
  Id,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { StudentEnrollmentPersistence } from './enrollment.models';

export const EnrollmentMapper = {
  persistenceToAggregate(doc: StudentEnrollmentPersistence): EnrollmentAggregate {
    return EnrollmentAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.studentId),
      Id.rehydrate(doc.classId),
      doc.rollNumber ?? null,
      doc.academicYear,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(enrollment: EnrollmentAggregate) {
    return {
      _id: enrollment.id.value,
      schoolId: enrollment.schoolId.value,
      studentId: enrollment.studentId.value,
      classId: enrollment.classId.value,
      rollNumber: enrollment.rollNumber,
      academicYear: enrollment.academicYear,
      deleted: {
        deleted: enrollment.deleted.isDeleted,
        at: enrollment.deleted.from?.value ?? null,
        by: enrollment.deleted.performedBy?.value ?? null,
        reason: enrollment.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(enrollment: EnrollmentAggregate): EnrollmentReadModel {
    return {
      id: enrollment.id.value,
      schoolId: enrollment.schoolId.value,
      studentId: enrollment.studentId.value,
      classId: enrollment.classId.value,
      rollNumber: enrollment.rollNumber,
      academicYear: enrollment.academicYear,
      isDeleted: enrollment.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: StudentEnrollmentPersistence): EnrollmentReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      studentId: doc.studentId,
      classId: doc.classId,
      rollNumber: doc.rollNumber ?? null,
      academicYear: doc.academicYear,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
