import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createLeaveModule } from '../leave.module';

const leaveRoutes = new Hono();
const { leaveController } = createLeaveModule();

leaveRoutes.get('/', authMiddleware, adminMiddleware, leaveController.list);
leaveRoutes.get('/:id', authMiddleware, leaveController.getLeaveById);
leaveRoutes.post('/', authMiddleware, leaveController.submit);
leaveRoutes.patch('/approve', authMiddleware, adminMiddleware, leaveController.approve);
leaveRoutes.patch('/reject', authMiddleware, adminMiddleware, leaveController.reject);
leaveRoutes.delete('/soft', authMiddleware, adminMiddleware, leaveController.softDelete);

export default leaveRoutes;
