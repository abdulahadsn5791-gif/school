import { auditEntityParamsDto, getAuditLogsDto } from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { AuditLogAppService } from '../application/audit-log.app.service';

export class AuditLogController extends BaseController<AuditLogAppService> {
  listByEntity = async (c: Context) => {
    const params = this.param(c, 'entityType', auditEntityParamsDto.shape.entityType);
    const entityId = this.param(c, 'entityId', auditEntityParamsDto.shape.entityId);
    return this.ok(c, await this.service.findByEntity(params, entityId));
  };

  listBySchool = async (c: Context) => {
    const query = this.query(c, getAuditLogsDto);
    if (!query.schoolId) return this.ok(c, []);
    return this.ok(c, await this.service.findBySchool(query.schoolId));
  };

  listByActor = async (c: Context) => {
    const query = this.query(c, getAuditLogsDto);
    if (!query.actorId) return this.ok(c, []);
    return this.ok(c, await this.service.findByActor(query.actorId));
  };
}
