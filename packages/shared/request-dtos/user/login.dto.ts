import { z } from 'zod';
import { PasswordSchema } from '../../dtos';

export const loginUserDto = z.object({
  email: z.string().trim().toLowerCase().email('Email must be a valid email address'),
  password: PasswordSchema,
});

export type LoginUserType = z.infer<typeof loginUserDto>;
