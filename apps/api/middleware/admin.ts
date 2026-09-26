import { createMiddleware } from 'hono/factory';
import { ForbiddenError } from '../errors/app-error';

export const adminMiddleware = createMiddleware(async (c, next) => {
  const role = c.get('role');

  if (role !== 'admin') {
    throw new ForbiddenError('Administrator access is required for this action.');
  }

  await next();
});

/**
 * Gate for teacher self-service. Allows admins and teachers through; per-resource
 * ownership is still enforced inside each app service (the middleware cannot know
 * which class/assignment the request targets).
 */
export const teacherOrAdminMiddleware = createMiddleware(async (c, next) => {
  const role = c.get('role');

  if (role !== 'admin' && role !== 'teacher') {
    throw new ForbiddenError('Teacher or administrator access is required for this action.');
  }

  await next();
});
