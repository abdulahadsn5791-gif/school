import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  LeaveAggregate,
  type LeaveReadModel,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { LeaveApplicationPersistence } from './leave.models';

export const LeaveMapper = {
  persistenceToAggregate(doc: LeaveApplicationPersistence): LeaveAggregate {
    return LeaveAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.applicantId),
      doc.applicantRole,
      doc.classId ? Id.rehydrate(doc.classId) : null,
      doc.fromDate,
      doc.toDate,
      doc.reason,
      doc.status,
      doc.reviewedBy ? Id.rehydrate(doc.reviewedBy) : null,
      doc.reviewedAt ?? null,
      doc.reviewRemark ?? null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(leave: LeaveAggregate) {
    return {
      _id: leave.id.value,
      schoolId: leave.schoolId.value,
      applicantId: leave.applicantId.value,
      applicantRole: leave.applicantRole,
      classId: leave.classId?.value ?? null,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      reason: leave.reason,
      status: leave.status,
      reviewedBy: leave.reviewedBy?.value ?? null,
      reviewedAt: leave.reviewedAt,
      reviewRemark: leave.reviewRemark,
      deleted: {
        deleted: leave.deleted.isDeleted,
        at: leave.deleted.from?.value ?? null,
        by: leave.deleted.performedBy?.value ?? null,
        reason: leave.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(leave: LeaveAggregate): LeaveReadModel {
    return {
      id: leave.id.value,
      schoolId: leave.schoolId.value,
      applicantId: leave.applicantId.value,
      applicantRole: leave.applicantRole,
      classId: leave.classId?.value ?? null,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      reason: leave.reason,
      status: leave.status,
      reviewedBy: leave.reviewedBy?.value ?? null,
      reviewedAt: leave.reviewedAt,
      reviewRemark: leave.reviewRemark,
      isDeleted: leave.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: LeaveApplicationPersistence): LeaveReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      applicantId: doc.applicantId,
      applicantRole: doc.applicantRole,
      classId: doc.classId ?? null,
      fromDate: doc.fromDate,
      toDate: doc.toDate,
      reason: doc.reason,
      status: doc.status,
      reviewedBy: doc.reviewedBy ?? null,
      reviewedAt: doc.reviewedAt ?? null,
      reviewRemark: doc.reviewRemark ?? null,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
