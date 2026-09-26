import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createAssignmentModule } from '../assignment.module';

const assignmentRoutes = new Hono();
const { assignmentController } = createAssignmentModule();

assignmentRoutes.get('/', authMiddleware, assignmentController.list);
assignmentRoutes.get('/:id', authMiddleware, assignmentController.getAssignmentById);
assignmentRoutes.post('/', authMiddleware, adminMiddleware, assignmentController.create);
assignmentRoutes.patch('/', authMiddleware, adminMiddleware, assignmentController.update);
assignmentRoutes.patch('/recover', authMiddleware, adminMiddleware, assignmentController.recover);
assignmentRoutes.delete('/soft', authMiddleware, adminMiddleware, assignmentController.softDelete);

export default assignmentRoutes;
