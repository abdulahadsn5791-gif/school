import { Hono } from 'hono';
import { adminMiddleware, teacherOrAdminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createEnrollmentModule } from '../enrollment.module';

const enrollmentRoutes = new Hono();
const { enrollmentController } = createEnrollmentModule();

// `/roster` and `/student-names` are registered before `/:id` so the static
// segment always wins.
enrollmentRoutes.get(
  '/roster',
  authMiddleware,
  teacherOrAdminMiddleware,
  enrollmentController.roster,
);
enrollmentRoutes.get(
  '/student-names',
  authMiddleware,
  teacherOrAdminMiddleware,
  enrollmentController.studentNameIndex,
);
enrollmentRoutes.get('/', authMiddleware, enrollmentController.list);
enrollmentRoutes.get('/:id', authMiddleware, enrollmentController.getEnrollmentById);
enrollmentRoutes.post('/', authMiddleware, adminMiddleware, enrollmentController.create);
enrollmentRoutes.patch('/', authMiddleware, adminMiddleware, enrollmentController.update);
enrollmentRoutes.patch('/recover', authMiddleware, adminMiddleware, enrollmentController.recover);
enrollmentRoutes.delete('/soft', authMiddleware, adminMiddleware, enrollmentController.softDelete);

export default enrollmentRoutes;
