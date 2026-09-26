import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createAuditLogModule } from '../audit-log.module';

const auditLogRoutes = new Hono();
const { auditLogController } = createAuditLogModule();

auditLogRoutes.get('/school', authMiddleware, adminMiddleware, auditLogController.listBySchool);
auditLogRoutes.get('/actor', authMiddleware, adminMiddleware, auditLogController.listByActor);
auditLogRoutes.get(
  '/entity/:entityType/:entityId',
  authMiddleware,
  adminMiddleware,
  auditLogController.listByEntity,
);

export default auditLogRoutes;
