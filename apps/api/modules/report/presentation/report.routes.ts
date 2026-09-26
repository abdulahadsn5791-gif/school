import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createReportModule } from '../report.module';

const reportRoutes = new Hono();
const { reportController } = createReportModule();

reportRoutes.get('/', authMiddleware, reportController.list);
reportRoutes.get('/:id', authMiddleware, reportController.getReportById);
reportRoutes.post('/', authMiddleware, adminMiddleware, reportController.create);
reportRoutes.patch('/', authMiddleware, adminMiddleware, reportController.update);
reportRoutes.delete('/soft', authMiddleware, adminMiddleware, reportController.softDelete);

export default reportRoutes;
