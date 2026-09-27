import { Hono } from 'hono';
import { adminMiddleware, teacherOrAdminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createAttendanceModule } from '../attendance.module';

const attendanceRoutes = new Hono();
const { attendanceController } = createAttendanceModule();

attendanceRoutes.get('/', authMiddleware, attendanceController.list);
attendanceRoutes.get('/student', authMiddleware, attendanceController.getByStudent);
attendanceRoutes.get('/register', authMiddleware, attendanceController.register);
attendanceRoutes.get('/class-day', authMiddleware, attendanceController.getByClassAndDate);
attendanceRoutes.post('/mark', authMiddleware, teacherOrAdminMiddleware, attendanceController.mark);
attendanceRoutes.patch('/', authMiddleware, adminMiddleware, attendanceController.update);
attendanceRoutes.delete('/soft', authMiddleware, adminMiddleware, attendanceController.softDelete);

export default attendanceRoutes;
