import {
  CalendarEventAggregate,
  type CalendarEventReadModel,
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { CalendarEventPersistence } from './event.models';

export const EventMapper = {
  persistenceToAggregate(doc: CalendarEventPersistence): CalendarEventAggregate {
    return CalendarEventAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.title,
      doc.description ?? null,
      doc.type,
      doc.startDate,
      doc.endDate,
      doc.classId ? Id.rehydrate(doc.classId) : null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(event: CalendarEventAggregate) {
    return {
      _id: event.id.value,
      schoolId: event.schoolId.value,
      title: event.title.value,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      classId: event.classId?.value ?? null,
      deleted: {
        deleted: event.deleted.isDeleted,
        at: event.deleted.from?.value ?? null,
        by: event.deleted.performedBy?.value ?? null,
        reason: event.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(event: CalendarEventAggregate): CalendarEventReadModel {
    return {
      id: event.id.value,
      schoolId: event.schoolId.value,
      title: event.title.value,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      classId: event.classId?.value ?? null,
      isDeleted: event.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: CalendarEventPersistence): CalendarEventReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      title: doc.title,
      description: doc.description ?? null,
      type: doc.type,
      startDate: doc.startDate,
      endDate: doc.endDate,
      classId: doc.classId ?? null,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
