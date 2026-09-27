import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createTimetableModule } from '../timetable.module';

const timetableRoutes = new Hono();
const { timetableController } = createTimetableModule();

timetableRoutes.get('/', authMiddleware, timetableController.list);
timetableRoutes.get('/screen/teacher', authMiddleware, timetableController.teacherScreen);
timetableRoutes.get('/:id', authMiddleware, timetableController.getEntryById);
timetableRoutes.post('/', authMiddleware, adminMiddleware, timetableController.create);
timetableRoutes.patch('/', authMiddleware, adminMiddleware, timetableController.update);
timetableRoutes.patch('/recover', authMiddleware, adminMiddleware, timetableController.recover);
timetableRoutes.delete('/soft', authMiddleware, adminMiddleware, timetableController.softDelete);

export default timetableRoutes;
