import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
  SchoolAggregate,
  type SchoolReadModel,
} from '@ecomerece/domain';
import type { SchoolPersistence } from './school.models';

export const SchoolMapper = {
  persistenceToAggregate(doc: SchoolPersistence): SchoolAggregate {
    return SchoolAggregate.rehydrate(
      Id.rehydrate(doc._id),
      doc.name,
      doc.code,
      doc.address ?? null,
      doc.phone ?? null,
      doc.email ?? null,
      doc.logoUrl ?? null,
      doc.timezone ?? 'Asia/Karachi',
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(school: SchoolAggregate) {
    return {
      _id: school.id.value,
      name: school.name.value,
      code: school.code,
      address: school.address,
      phone: school.phone,
      email: school.email,
      logoUrl: school.logoUrl,
      timezone: school.timezone,
      deleted: {
        deleted: school.deleted.isDeleted,
        at: school.deleted.from?.value ?? null,
        by: school.deleted.performedBy?.value ?? null,
        reason: school.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(school: SchoolAggregate): SchoolReadModel {
    return {
      id: school.id.value,
      name: school.name.value,
      code: school.code,
      address: school.address,
      phone: school.phone,
      email: school.email,
      logoUrl: school.logoUrl,
      timezone: school.timezone,
      isDeleted: school.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: SchoolPersistence): SchoolReadModel {
    return {
      id: doc._id,
      name: doc.name,
      code: doc.code,
      address: doc.address ?? null,
      phone: doc.phone ?? null,
      email: doc.email ?? null,
      logoUrl: doc.logoUrl ?? null,
      timezone: doc.timezone ?? 'Asia/Karachi',
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
