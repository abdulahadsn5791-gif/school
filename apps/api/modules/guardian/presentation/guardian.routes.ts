import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createGuardianModule } from '../guardian.module';

const guardianRoutes = new Hono();
const { guardianController } = createGuardianModule();

guardianRoutes.get('/', authMiddleware, guardianController.list);
guardianRoutes.get('/:id', authMiddleware, guardianController.getGuardianById);
guardianRoutes.post('/', authMiddleware, adminMiddleware, guardianController.create);
guardianRoutes.patch('/', authMiddleware, adminMiddleware, guardianController.update);
guardianRoutes.patch('/recover', authMiddleware, adminMiddleware, guardianController.recover);
guardianRoutes.delete('/soft', authMiddleware, adminMiddleware, guardianController.softDelete);

export default guardianRoutes;
