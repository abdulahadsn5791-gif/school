import { z } from 'zod';
import { NameInfoSchema, PasswordSchema } from '../../dtos';

export const registerUserDto = z.object({
  name: NameInfoSchema,
  email: z.string().trim().toLowerCase().email('Email must be a valid email address'),
  password: PasswordSchema,
});

export type RegisterUserType = z.infer<typeof registerUserDto>;
