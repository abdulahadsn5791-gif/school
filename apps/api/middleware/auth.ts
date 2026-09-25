import { createMiddleware } from 'hono/factory';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import { getBearerToken } from '../lib/getBearerToken';
import { verifyJwt } from '../lib/jwt';
import { UserModel } from '../modules/user/infra/user.models';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  const token = getBearerToken(authHeader);

  if (!token) {
    throw new UnauthorizedError('An authentication token is required.');
  }

  let payload: { userId: string; role: string };

  try {
    const { payload: verified } = await verifyJwt(token);
    payload = verified as { userId: string; role: string };
  } catch {
    throw new UnauthorizedError('The provided token is invalid or has expired.');
  }

  const userId = payload.userId;

  const user = await UserModel.findById(userId);

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

  c.set('userId', userId);
  c.set('email', user.email);
  c.set('role', user.role.role);
  c.set('user', user);

  await next();
});
