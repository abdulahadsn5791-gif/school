import { z } from 'zod';
import { AvatarSchema, NameInfoSchema, PasswordSchema, UserRoleSchema } from '../../dtos';

export const createUserDto = z.object({
  name: NameInfoSchema,
  email: z.string().trim().toLowerCase().email('Email must be a valid email address'),
  password: PasswordSchema,
  role: UserRoleSchema,
  avatar: AvatarSchema.optional(),
});

export type CreateUserType = z.infer<typeof createUserDto>;
