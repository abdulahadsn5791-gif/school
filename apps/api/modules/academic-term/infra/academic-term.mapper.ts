import {
  AcademicTermAggregate,
  type AcademicTermReadModel,
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { AcademicTermPersistence } from './academic-term.models';

export const AcademicTermMapper = {
  persistenceToAggregate(doc: AcademicTermPersistence): AcademicTermAggregate {
    return AcademicTermAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.academicYear,
      doc.name,
      doc.startDate,
      doc.endDate,
      doc.isCurrent,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(term: AcademicTermAggregate) {
    return {
      _id: term.id.value,
      schoolId: term.schoolId.value,
      academicYear: term.academicYear,
      name: term.name.value,
      startDate: term.startDate,
      endDate: term.endDate,
      isCurrent: term.isCurrent,
      deleted: {
        deleted: term.deleted.isDeleted,
        at: term.deleted.from?.value ?? null,
        by: term.deleted.performedBy?.value ?? null,
        reason: term.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(term: AcademicTermAggregate): AcademicTermReadModel {
    return {
      id: term.id.value,
      schoolId: term.schoolId.value,
      academicYear: term.academicYear,
      name: term.name.value,
      startDate: term.startDate,
      endDate: term.endDate,
      isCurrent: term.isCurrent,
      isDeleted: term.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: AcademicTermPersistence): AcademicTermReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      academicYear: doc.academicYear,
      name: doc.name,
      startDate: doc.startDate,
      endDate: doc.endDate,
      isCurrent: doc.isCurrent,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
