import { Hono } from 'hono';

import usersRoutes from '../modules/user/presentation/user.routes';

const routes = new Hono();

routes.route('/users', usersRoutes);

export default routes;
