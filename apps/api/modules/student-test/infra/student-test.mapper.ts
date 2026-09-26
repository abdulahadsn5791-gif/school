import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
  StudentTestAggregate,
  type StudentTestReadModel,
} from '@ecomerece/domain';
import type { StudentTestPersistence } from './student-test.models';

export const StudentTestMapper = {
  persistenceToAggregate(doc: StudentTestPersistence): StudentTestAggregate {
    return StudentTestAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.assignmentId),
      Id.rehydrate(doc.studentId),
      doc.status,
      doc.submissionText ?? null,
      doc.submissionFiles ?? [],
      doc.submittedAt ?? null,
      doc.marksObtained ?? null,
      doc.teacherFeedback ?? null,
      doc.gradedBy ? Id.rehydrate(doc.gradedBy) : null,
      doc.gradedAt ?? null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(submission: StudentTestAggregate) {
    return {
      _id: submission.id.value,
      schoolId: submission.schoolId.value,
      assignmentId: submission.assignmentId.value,
      studentId: submission.studentId.value,
      status: submission.status,
      submissionText: submission.submissionText,
      submissionFiles: submission.submissionFiles,
      submittedAt: submission.submittedAt,
      marksObtained: submission.marksObtained,
      teacherFeedback: submission.teacherFeedback,
      gradedBy: submission.gradedBy?.value ?? null,
      gradedAt: submission.gradedAt,
      deleted: {
        deleted: submission.deleted.isDeleted,
        at: submission.deleted.from?.value ?? null,
        by: submission.deleted.performedBy?.value ?? null,
        reason: submission.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(submission: StudentTestAggregate): StudentTestReadModel {
    return {
      id: submission.id.value,
      schoolId: submission.schoolId.value,
      assignmentId: submission.assignmentId.value,
      studentId: submission.studentId.value,
      status: submission.status,
      submissionText: submission.submissionText,
      submissionFiles: submission.submissionFiles,
      submittedAt: submission.submittedAt,
      marksObtained: submission.marksObtained,
      teacherFeedback: submission.teacherFeedback,
      gradedBy: submission.gradedBy?.value ?? null,
      gradedAt: submission.gradedAt,
      isDeleted: submission.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: StudentTestPersistence): StudentTestReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      assignmentId: doc.assignmentId,
      studentId: doc.studentId,
      status: doc.status,
      submissionText: doc.submissionText ?? null,
      submissionFiles: doc.submissionFiles ?? [],
      submittedAt: doc.submittedAt ?? null,
      marksObtained: doc.marksObtained ?? null,
      teacherFeedback: doc.teacherFeedback ?? null,
      gradedBy: doc.gradedBy ?? null,
      gradedAt: doc.gradedAt ?? null,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
