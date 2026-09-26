import type { IAuditLogRepository } from '@ecomerece/domain';
import { AuditLogAggregate, type AuditLogReadModel, Id } from '@ecomerece/domain';

export type AuditEntryInput = {
  schoolId: string | null;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
};

export class AuditLogAppService {
  constructor(private readonly auditRepo: IAuditLogRepository) {}

  /** Append an immutable audit entry. Never throws into the caller's flow. */
  async append(input: AuditEntryInput): Promise<void> {
    try {
      const entry = AuditLogAggregate.create({
        id: Id.create(),
        schoolId: input.schoolId ? Id.create(input.schoolId) : null,
        actorId: input.actorId ? Id.create(input.actorId) : null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata ?? null,
        at: new Date(),
      });
      await this.auditRepo.Append(entry);
    } catch {
      // Auditing must not break the primary operation.
    }
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    limit?: number,
  ): Promise<AuditLogReadModel[]> {
    const entries = await this.auditRepo.FindByEntity(entityType, entityId, limit);
    return entries.map((entry) => this.toReadModel(entry));
  }

  async findBySchool(schoolId: string, limit?: number): Promise<AuditLogReadModel[]> {
    const entries = await this.auditRepo.FindBySchool(Id.create(schoolId), limit);
    return entries.map((entry) => this.toReadModel(entry));
  }

  async findByActor(actorId: string, limit?: number): Promise<AuditLogReadModel[]> {
    const entries = await this.auditRepo.FindByActor(Id.create(actorId), limit);
    return entries.map((entry) => this.toReadModel(entry));
  }

  private toReadModel(entry: AuditLogAggregate): AuditLogReadModel {
    return {
      id: entry.id.value,
      schoolId: entry.schoolId?.value ?? null,
      actorId: entry.actorId?.value ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata,
      at: entry.at,
    };
  }
}
