import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createPeriodModule } from '../period.module';

const periodRoutes = new Hono();
const { periodController } = createPeriodModule();

periodRoutes.get('/', authMiddleware, periodController.list);
periodRoutes.get('/:id', authMiddleware, periodController.getPeriodById);
periodRoutes.post('/', authMiddleware, adminMiddleware, periodController.create);
periodRoutes.patch('/', authMiddleware, adminMiddleware, periodController.update);
periodRoutes.patch('/recover', authMiddleware, adminMiddleware, periodController.recover);
periodRoutes.delete('/soft', authMiddleware, adminMiddleware, periodController.softDelete);

export default periodRoutes;
