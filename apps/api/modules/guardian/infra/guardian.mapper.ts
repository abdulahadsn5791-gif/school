import {
  DeleteInfoVO,
  EffectiveDate,
  GuardianAggregate,
  type GuardianReadModel,
  Id,
  NameInfoVO,
  PersonName,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { GuardianPersistence } from './guardian.models';

export const GuardianMapper = {
  persistenceToAggregate(doc: GuardianPersistence): GuardianAggregate {
    return GuardianAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      NameInfoVO.create(
        PersonName.create(doc.name.firstName),
        doc.name.middleName ? PersonName.create(doc.name.middleName) : null,
        doc.name.lastName ? PersonName.create(doc.name.lastName) : null,
      ),
      doc.phone,
      doc.email ?? null,
      doc.occupation ?? null,
      doc.userId ? Id.rehydrate(doc.userId) : null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(guardian: GuardianAggregate) {
    return {
      _id: guardian.id.value,
      schoolId: guardian.schoolId.value,
      name: {
        firstName: guardian.name.firstName.value,
        middleName: guardian.name.middleName?.value ?? null,
        lastName: guardian.name.lastName?.value ?? null,
        fullName: guardian.name.fullName,
      },
      phone: guardian.phone,
      email: guardian.email,
      occupation: guardian.occupation,
      userId: guardian.userId?.value ?? null,
      deleted: {
        deleted: guardian.deleted.isDeleted,
        at: guardian.deleted.from?.value ?? null,
        by: guardian.deleted.performedBy?.value ?? null,
        reason: guardian.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(guardian: GuardianAggregate): GuardianReadModel {
    return {
      id: guardian.id.value,
      schoolId: guardian.schoolId.value,
      name: {
        firstName: guardian.name.firstName.value,
        middleName: guardian.name.middleName?.value ?? null,
        lastName: guardian.name.lastName?.value ?? null,
        fullName: guardian.name.fullName,
      },
      phone: guardian.phone,
      email: guardian.email,
      occupation: guardian.occupation,
      userId: guardian.userId?.value ?? null,
      isDeleted: guardian.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: GuardianPersistence): GuardianReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      name: {
        firstName: doc.name.firstName,
        middleName: doc.name.middleName ?? null,
        lastName: doc.name.lastName ?? null,
        fullName: doc.name.fullName,
      },
      phone: doc.phone,
      email: doc.email ?? null,
      occupation: doc.occupation ?? null,
      userId: doc.userId ?? null,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
