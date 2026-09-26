import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createNoticeModule } from '../notice.module';

const noticeRoutes = new Hono();
const { noticeController } = createNoticeModule();

noticeRoutes.get('/', authMiddleware, noticeController.list);
noticeRoutes.get('/:id', authMiddleware, noticeController.getNoticeById);
noticeRoutes.post('/', authMiddleware, adminMiddleware, noticeController.create);
noticeRoutes.patch('/', authMiddleware, adminMiddleware, noticeController.update);
noticeRoutes.patch('/recover', authMiddleware, adminMiddleware, noticeController.recover);
noticeRoutes.delete('/soft', authMiddleware, adminMiddleware, noticeController.softDelete);

export default noticeRoutes;
