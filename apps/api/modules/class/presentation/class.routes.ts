import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createClassModule } from '../class.module';

const classRoutes = new Hono();
const { classController } = createClassModule();

classRoutes.get('/', authMiddleware, classController.list);
classRoutes.get('/:id', authMiddleware, classController.getClassById);
classRoutes.post('/', authMiddleware, adminMiddleware, classController.create);
classRoutes.patch('/', authMiddleware, adminMiddleware, classController.update);
classRoutes.patch('/recover', authMiddleware, adminMiddleware, classController.recover);
classRoutes.delete('/soft', authMiddleware, adminMiddleware, classController.softDelete);

export default classRoutes;
