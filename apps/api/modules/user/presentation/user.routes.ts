import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createUserModule } from '../user.module';

const usersRoutes = new Hono();
const { userController } = createUserModule();

usersRoutes.post('/login', userController.login);
usersRoutes.get('/me', authMiddleware, userController.getMe);
usersRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  userController.getAdminPaginatedUsers,
);
usersRoutes.get('/', authMiddleware, adminMiddleware, userController.getAdminPaginatedUsers);
usersRoutes.patch('/block/lift', authMiddleware, adminMiddleware, userController.blockLift);
usersRoutes.patch('/ban/lift', authMiddleware, adminMiddleware, userController.banLift);
usersRoutes.patch('/ban/extend', authMiddleware, adminMiddleware, userController.extendBan);
usersRoutes.patch('/ban/short', authMiddleware, adminMiddleware, userController.shortBan);
usersRoutes.patch('/block', authMiddleware, adminMiddleware, userController.blockUser);
usersRoutes.patch('/ban', authMiddleware, adminMiddleware, userController.banUser);
usersRoutes.patch('/role', authMiddleware, adminMiddleware, userController.assignRole);
usersRoutes.patch('/recover', authMiddleware, adminMiddleware, userController.recover);
usersRoutes.post('/', authMiddleware, adminMiddleware, userController.create);
usersRoutes.delete('/soft', authMiddleware, adminMiddleware, userController.softDelete);
usersRoutes.patch('/:id', authMiddleware, adminMiddleware, userController.update);
usersRoutes.get('/:id', authMiddleware, adminMiddleware, userController.getUserById);

export default usersRoutes;
