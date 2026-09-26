import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createAcademicTermModule } from '../academic-term.module';

const academicTermRoutes = new Hono();
const { academicTermController } = createAcademicTermModule();

academicTermRoutes.get('/', authMiddleware, academicTermController.list);
academicTermRoutes.get('/:id', authMiddleware, academicTermController.getTermById);
academicTermRoutes.post('/', authMiddleware, adminMiddleware, academicTermController.create);
academicTermRoutes.patch('/', authMiddleware, adminMiddleware, academicTermController.update);
academicTermRoutes.patch(
  '/recover',
  authMiddleware,
  adminMiddleware,
  academicTermController.recover,
);
academicTermRoutes.delete(
  '/soft',
  authMiddleware,
  adminMiddleware,
  academicTermController.softDelete,
);

export default academicTermRoutes;
