import {
  ClassAggregate,
  type ClassReadModel,
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { ClassPersistence } from './class.models';

export const ClassMapper = {
  persistenceToAggregate(doc: ClassPersistence): ClassAggregate {
    return ClassAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.name,
      doc.grade,
      doc.section,
      doc.academicYear,
      doc.classTeacherId ? Id.rehydrate(doc.classTeacherId) : null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(clazz: ClassAggregate) {
    return {
      _id: clazz.id.value,
      schoolId: clazz.schoolId.value,
      name: clazz.name.value,
      grade: clazz.grade,
      section: clazz.section,
      academicYear: clazz.academicYear,
      classTeacherId: clazz.classTeacherId?.value ?? null,
      deleted: {
        deleted: clazz.deleted.isDeleted,
        at: clazz.deleted.from?.value ?? null,
        by: clazz.deleted.performedBy?.value ?? null,
        reason: clazz.deleted.reason?.value ?? null,
      },
    };
  },

  persistenceToReadModel(doc: ClassPersistence): ClassReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      name: doc.name,
      grade: doc.grade,
      section: doc.section,
      academicYear: doc.academicYear,
      classTeacherId: doc.classTeacherId ?? null,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },

  aggregateToReadModel(clazz: ClassAggregate): ClassReadModel {
    return {
      id: clazz.id.value,
      schoolId: clazz.schoolId.value,
      name: clazz.name.value,
      grade: clazz.grade,
      section: clazz.section,
      academicYear: clazz.academicYear,
      classTeacherId: clazz.classTeacherId?.value ?? null,
      isDeleted: clazz.isDeleted,
      createdAt: new Date(),
    };
  },
};
