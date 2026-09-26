import { AuditLogAppService } from './application/audit-log.app.service';
import { AuditLogRepository } from './infra/audit-log.repository';
import { AuditLogController } from './presentation/audit-log.controller';

export function createAuditLogModule() {
  const auditRepo = new AuditLogRepository();
  const appSvc = new AuditLogAppService(auditRepo);
  const auditLogController = new AuditLogController(appSvc);

  return {
    auditLogController,
    appSvc,
  };
}
