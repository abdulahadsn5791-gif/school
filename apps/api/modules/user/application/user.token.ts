import { createToken } from '../../../lib/jwt';

const TOKEN_EXPIRES_IN = '1d';

export const createUserToken = async (userId: string, role: string): Promise<string> => {
  return createToken({ userId, role }, TOKEN_EXPIRES_IN);
};
