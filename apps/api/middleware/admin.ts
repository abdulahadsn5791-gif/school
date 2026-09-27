import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { Actor } from '../core/actor/actor';
import { ForbiddenError } from '../errors/app-error';

/**
 * Elevates the request's Actor to the admin tier (new.md §2: tier is set by the
 * ROUTE, never by client input). Chain AFTER authMiddleware.
 */
function elevateTier(c: Context) {
  const actor = c.get('actor') as Actor | undefined;
  if (actor) c.set('actor', actor.withTier('admin'));
}

export const adminMiddleware = createMiddleware(async (c, next) => {
  const role = c.get('role');

  if (role !== 'admin') {
    throw new ForbiddenError('Administrator access is required for this action.');
  }

  elevateTier(c);
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

  elevateTier(c);
  await next();
});
