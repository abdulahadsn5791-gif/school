import type { Id } from '../../../value-objects';
import type { AuditLogAggregate } from '../audit-log.aggregate';

export interface IAuditLogRepository {
  Append(entry: AuditLogAggregate): Promise<void>;
  /** Newest-first entries for one entity. */
  FindByEntity(entityType: string, entityId: string, limit?: number): Promise<AuditLogAggregate[]>;
  /** Newest-first entries for one school. */
  FindBySchool(schoolId: Id, limit?: number): Promise<AuditLogAggregate[]>;
  /** Newest-first entries by one actor. */
  FindByActor(actorId: Id, limit?: number): Promise<AuditLogAggregate[]>;
}
