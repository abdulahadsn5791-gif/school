import { AuditLogAggregate, type AuditLogReadModel, Id } from '@ecomerece/domain';
import type { AuditLogPersistence } from './audit-log.models';

export const AuditLogMapper = {
  persistenceToAggregate(doc: AuditLogPersistence): AuditLogAggregate {
    return AuditLogAggregate.rehydrate(
      Id.rehydrate(doc._id),
      doc.schoolId ? Id.rehydrate(doc.schoolId) : null,
      doc.actorId ? Id.rehydrate(doc.actorId) : null,
      doc.action,
      doc.entityType,
      doc.entityId,
      (doc.metadata as Record<string, unknown> | null) ?? null,
      doc.at,
    );
  },

  aggregateToPersistence(entry: AuditLogAggregate) {
    return {
      _id: entry.id.value,
      schoolId: entry.schoolId?.value ?? null,
      actorId: entry.actorId?.value ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata,
      at: entry.at,
    };
  },

  persistenceToReadModel(doc: AuditLogPersistence): AuditLogReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId ?? null,
      actorId: doc.actorId ?? null,
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      metadata: (doc.metadata as Record<string, unknown> | null) ?? null,
      at: doc.at,
    };
  },
};
