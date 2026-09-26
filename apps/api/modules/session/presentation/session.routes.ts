import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createSessionModule } from '../session.module';

const sessionRoutes = new Hono();
const { sessionController } = createSessionModule();

sessionRoutes.get('/', authMiddleware, adminMiddleware, sessionController.list);
sessionRoutes.post('/', authMiddleware, adminMiddleware, sessionController.issue);
sessionRoutes.patch('/revoke/all', authMiddleware, adminMiddleware, sessionController.revokeAll);
sessionRoutes.patch('/revoke', authMiddleware, adminMiddleware, sessionController.revoke);

export default sessionRoutes;
