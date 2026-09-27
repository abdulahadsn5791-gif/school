import { Id } from '@ecomerece/domain';
import { createMiddleware } from 'hono/factory';
import { Actor } from '../core/actor/actor';
import { actorContext } from '../core/actor/actor-context';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import { getBearerToken } from '../lib/getBearerToken';
import { verifyJwt } from '../lib/jwt';
import { type UserDocument, UserModel } from '../modules/user/infra/user.models';

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = getBearerToken(c.req.header('Authorization'));

  if (!token) {
    throw new UnauthorizedError('An authentication token is required.');
  }

  let payload: { userId: string; role: string };
  let user: UserDocument | null;

  try {
    const { payload: verified } = await verifyJwt(token);
    payload = verified as { userId: string; role: string };
    user = await UserModel.findById(payload.userId);
  } catch {
    throw new UnauthorizedError('The provided token is invalid or has expired.');
  }

  if (!user) {
    throw new UnauthorizedError('User is not initialized.');
  }

  if (user.deleted.deleted) {
    throw new ForbiddenError('This account has been deleted.');
  }
  if (user.ban.banned) {
    throw new ForbiddenError('This account has been banned.');
  }
  if (user.block.blocked) {
    throw new ForbiddenError('This account has been blocked.');
  }

  // Engine rule (new.md §2): the Actor is built ONCE here — token → user → role —
  // and every downstream check derives from it. Tier starts at 'public';
  // adminMiddleware elevates it for admin routes only.
  const actor = new Actor({
    id: Id.rehydrate(payload.userId),
    role: user.role.role,
    tier: 'public',
    schoolId: null,
  });

  c.set('actor', actor);
  c.set('userId', payload.userId);
  c.set('email', user.email);
  c.set('role', user.role.role);
  c.set('user', user);

  await actorContext.run(actor, next);
});
