import { jwtVerify, SignJWT } from 'jose';

let secret: Uint8Array | null = null;

/**
 * JWT_SECRET is read lazily on first use (not at import time) so tests and
 * runtime bootstrapping can set it after the module graph loads.
 */
const getSecret = (): Uint8Array => {
  if (!secret) {
    const envSecret = process.env.JWT_SECRET;
    if (!envSecret) throw new Error('JWT_SECRET is not set.');
    secret = new TextEncoder().encode(envSecret);
  }
  return secret;
};

export const createToken = async (
  payload: { userId: string; role: string },
  expiresIn: string | number = '7d',
) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
};

export const verifyJwt = async (token: string) => {
  return await jwtVerify(token, getSecret());
};
