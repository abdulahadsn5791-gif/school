import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
  SubjectAggregate,
  type SubjectReadModel,
} from '@ecomerece/domain';
import type { SubjectPersistence } from './subject.models';

export const SubjectMapper = {
  persistenceToAggregate(doc: SubjectPersistence): SubjectAggregate {
    return SubjectAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.name,
      doc.code,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(subject: SubjectAggregate) {
    return {
      _id: subject.id.value,
      schoolId: subject.schoolId.value,
      name: subject.name.value,
      code: subject.code,
      deleted: {
        deleted: subject.deleted.isDeleted,
        at: subject.deleted.from?.value ?? null,
        by: subject.deleted.performedBy?.value ?? null,
        reason: subject.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(subject: SubjectAggregate): SubjectReadModel {
    return {
      id: subject.id.value,
      schoolId: subject.schoolId.value,
      name: subject.name.value,
      code: subject.code,
      isDeleted: subject.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: SubjectPersistence): SubjectReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      name: doc.name,
      code: doc.code,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
