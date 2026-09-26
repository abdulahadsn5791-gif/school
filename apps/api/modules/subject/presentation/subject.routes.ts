import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createSubjectModule } from '../subject.module';

const subjectRoutes = new Hono();
const { subjectController } = createSubjectModule();

subjectRoutes.get('/', authMiddleware, subjectController.list);
subjectRoutes.get('/:id', authMiddleware, subjectController.getSubjectById);
subjectRoutes.post('/', authMiddleware, adminMiddleware, subjectController.create);
subjectRoutes.patch('/', authMiddleware, adminMiddleware, subjectController.update);
subjectRoutes.patch('/recover', authMiddleware, adminMiddleware, subjectController.recover);
subjectRoutes.delete('/soft', authMiddleware, adminMiddleware, subjectController.softDelete);

export default subjectRoutes;
