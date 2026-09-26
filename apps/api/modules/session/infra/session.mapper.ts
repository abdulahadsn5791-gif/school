import { Id, Quantity, SessionAggregate, type SessionReadModel } from '@ecomerece/domain';
import type { RefreshTokenPersistence } from './session.models';

export const SessionMapper = {
  persistenceToAggregate(doc: RefreshTokenPersistence): SessionAggregate {
    return SessionAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.userId),
      doc.tokenHash,
      doc.userAgent ?? null,
      doc.ip ?? null,
      doc.expiresAt,
      doc.revokedAt ?? null,
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(session: SessionAggregate) {
    return {
      _id: session.id.value,
      userId: session.userId.value,
      tokenHash: session.tokenHash,
      userAgent: session.userAgent,
      ip: session.ip,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  },

  aggregateToReadModel(session: SessionAggregate): SessionReadModel {
    return {
      id: session.id.value,
      userId: session.userId.value,
      userAgent: session.userAgent,
      ip: session.ip,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      isActive: session.isActive,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: RefreshTokenPersistence): SessionReadModel {
    return {
      id: doc._id,
      userId: doc.userId,
      userAgent: doc.userAgent ?? null,
      ip: doc.ip ?? null,
      expiresAt: doc.expiresAt,
      revokedAt: doc.revokedAt ?? null,
      isActive: (doc.revokedAt ?? null) === null && doc.expiresAt.getTime() > Date.now(),
      createdAt: doc.createdAt,
    };
  },
};
