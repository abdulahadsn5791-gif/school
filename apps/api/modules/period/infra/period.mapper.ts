import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  PeriodAggregate,
  type PeriodReadModel,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { PeriodPersistence } from './period.models';

export const PeriodMapper = {
  persistenceToAggregate(doc: PeriodPersistence): PeriodAggregate {
    return PeriodAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.name,
      doc.startTime,
      doc.endTime,
      doc.order,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(period: PeriodAggregate) {
    return {
      _id: period.id.value,
      schoolId: period.schoolId.value,
      name: period.name.value,
      startTime: period.startTime,
      endTime: period.endTime,
      order: period.order,
      deleted: {
        deleted: period.deleted.isDeleted,
        at: period.deleted.from?.value ?? null,
        by: period.deleted.performedBy?.value ?? null,
        reason: period.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(period: PeriodAggregate): PeriodReadModel {
    return {
      id: period.id.value,
      schoolId: period.schoolId.value,
      name: period.name.value,
      startTime: period.startTime,
      endTime: period.endTime,
      order: period.order,
      isDeleted: period.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: PeriodPersistence): PeriodReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      name: doc.name,
      startTime: doc.startTime,
      endTime: doc.endTime,
      order: doc.order,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
