import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createSchoolModule } from '../school.module';

const schoolRoutes = new Hono();
const { schoolController } = createSchoolModule();

schoolRoutes.get('/', authMiddleware, schoolController.list);
schoolRoutes.get('/code/:code', authMiddleware, schoolController.getSchoolByCode);
schoolRoutes.get('/:id', authMiddleware, schoolController.getSchoolById);
schoolRoutes.post('/', authMiddleware, adminMiddleware, schoolController.create);
schoolRoutes.patch('/', authMiddleware, adminMiddleware, schoolController.update);
schoolRoutes.patch('/recover', authMiddleware, adminMiddleware, schoolController.recover);
schoolRoutes.delete('/soft', authMiddleware, adminMiddleware, schoolController.softDelete);

export default schoolRoutes;
