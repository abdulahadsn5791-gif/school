import {
  AssignmentAggregate,
  type AssignmentReadModel,
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { AssignmentPersistence } from './assignment.models';

export const AssignmentMapper = {
  persistenceToAggregate(doc: AssignmentPersistence): AssignmentAggregate {
    return AssignmentAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.title,
      doc.description ?? null,
      doc.type,
      Id.rehydrate(doc.classId),
      Id.rehydrate(doc.subjectId),
      Id.rehydrate(doc.teacherId),
      doc.assignedDate,
      doc.dueDate,
      doc.totalMarks,
      doc.attachments ?? [],
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(assignment: AssignmentAggregate) {
    return {
      _id: assignment.id.value,
      schoolId: assignment.schoolId.value,
      title: assignment.title.value,
      description: assignment.description,
      type: assignment.type,
      classId: assignment.classId.value,
      subjectId: assignment.subjectId.value,
      teacherId: assignment.teacherId.value,
      assignedDate: assignment.assignedDate,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      attachments: assignment.attachments,
      deleted: {
        deleted: assignment.deleted.isDeleted,
        at: assignment.deleted.from?.value ?? null,
        by: assignment.deleted.performedBy?.value ?? null,
        reason: assignment.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(assignment: AssignmentAggregate): AssignmentReadModel {
    return {
      id: assignment.id.value,
      schoolId: assignment.schoolId.value,
      title: assignment.title.value,
      description: assignment.description,
      type: assignment.type,
      classId: assignment.classId.value,
      subjectId: assignment.subjectId.value,
      teacherId: assignment.teacherId.value,
      assignedDate: assignment.assignedDate,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      attachments: assignment.attachments,
      isDeleted: assignment.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: AssignmentPersistence): AssignmentReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      title: doc.title,
      description: doc.description ?? null,
      type: doc.type,
      classId: doc.classId,
      subjectId: doc.subjectId,
      teacherId: doc.teacherId,
      assignedDate: doc.assignedDate,
      dueDate: doc.dueDate,
      totalMarks: doc.totalMarks,
      attachments: doc.attachments ?? [],
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
