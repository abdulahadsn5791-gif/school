import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createStudentTestModule } from '../student-test.module';

const studentTestRoutes = new Hono();
const { studentTestController } = createStudentTestModule();

studentTestRoutes.get('/', authMiddleware, studentTestController.list);
studentTestRoutes.get('/:id', authMiddleware, studentTestController.getSubmissionById);
studentTestRoutes.post('/', authMiddleware, adminMiddleware, studentTestController.create);
studentTestRoutes.patch('/grade', authMiddleware, adminMiddleware, studentTestController.grade);
studentTestRoutes.patch(
  '/mark-missed',
  authMiddleware,
  adminMiddleware,
  studentTestController.markMissed,
);
studentTestRoutes.patch('/submit', authMiddleware, studentTestController.submit);
studentTestRoutes.delete(
  '/soft',
  authMiddleware,
  adminMiddleware,
  studentTestController.softDelete,
);

export default studentTestRoutes;
