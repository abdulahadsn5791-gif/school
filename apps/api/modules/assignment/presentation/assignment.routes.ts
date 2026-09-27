import { Hono } from 'hono';
import { adminMiddleware, teacherOrAdminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createAssignmentModule } from '../assignment.module';

const assignmentRoutes = new Hono();
const { assignmentController } = createAssignmentModule();

assignmentRoutes.get('/', authMiddleware, assignmentController.list);
assignmentRoutes.get('/screen/teacher', authMiddleware, assignmentController.teacherScreen);
assignmentRoutes.get('/:id', authMiddleware, assignmentController.getAssignmentById);
assignmentRoutes.post('/', authMiddleware, teacherOrAdminMiddleware, assignmentController.create);
assignmentRoutes.patch('/', authMiddleware, teacherOrAdminMiddleware, assignmentController.update);
assignmentRoutes.patch('/recover', authMiddleware, adminMiddleware, assignmentController.recover);
assignmentRoutes.delete('/soft', authMiddleware, adminMiddleware, assignmentController.softDelete);

export default assignmentRoutes;
