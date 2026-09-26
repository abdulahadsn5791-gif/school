import type { AuditLogAggregate, IAuditLogRepository, Id } from '@ecomerece/domain';
import { AuditLogMapper } from './audit-log.mapper';
import { AuditLogModel } from './audit-log.models';

const DEFAULT_LIMIT = 50;

export class AuditLogRepository implements IAuditLogRepository {
  async Append(entry: AuditLogAggregate): Promise<void> {
    const doc = new AuditLogModel(AuditLogMapper.aggregateToPersistence(entry));
    await doc.save();
  }

  async FindByEntity(
    entityType: string,
    entityId: string,
    limit: number = DEFAULT_LIMIT,
  ): Promise<AuditLogAggregate[]> {
    const docs = await AuditLogModel.find({ entityType, entityId })
      .sort({ at: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => AuditLogMapper.persistenceToAggregate(doc));
  }

  async FindBySchool(schoolId: Id, limit: number = DEFAULT_LIMIT): Promise<AuditLogAggregate[]> {
    const docs = await AuditLogModel.find({ schoolId: schoolId.value })
      .sort({ at: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => AuditLogMapper.persistenceToAggregate(doc));
  }

  async FindByActor(actorId: Id, limit: number = DEFAULT_LIMIT): Promise<AuditLogAggregate[]> {
    const docs = await AuditLogModel.find({ actorId: actorId.value })
      .sort({ at: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => AuditLogMapper.persistenceToAggregate(doc));
  }
}
