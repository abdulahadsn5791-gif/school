import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createEventModule } from '../event.module';

const eventRoutes = new Hono();
const { eventController } = createEventModule();

eventRoutes.get('/', authMiddleware, eventController.list);
eventRoutes.get('/:id', authMiddleware, eventController.getEventById);
eventRoutes.post('/', authMiddleware, adminMiddleware, eventController.create);
eventRoutes.patch('/', authMiddleware, adminMiddleware, eventController.update);
eventRoutes.patch('/recover', authMiddleware, adminMiddleware, eventController.recover);
eventRoutes.delete('/soft', authMiddleware, adminMiddleware, eventController.softDelete);

export default eventRoutes;
