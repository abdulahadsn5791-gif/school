import { Hono } from 'hono';

import classRoutes from '../modules/class/presentation/class.routes';
import enrollmentRoutes from '../modules/enrollment/presentation/enrollment.routes';
import usersRoutes from '../modules/user/presentation/user.routes';

const routes = new Hono();

routes.route('/classes', classRoutes);
routes.route('/enrollments', enrollmentRoutes);
routes.route('/users', usersRoutes);

export default routes;
