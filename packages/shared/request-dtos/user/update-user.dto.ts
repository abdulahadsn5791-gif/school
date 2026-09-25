import { z } from 'zod';
import { AvatarSchema, NameInfoSchema, PasswordSchema } from '../../dtos';

export const updateUserDto = z
  .object({
    name: NameInfoSchema.optional(),
    email: z.string().trim().toLowerCase().email('Email must be a valid email address').optional(),
    password: PasswordSchema.optional(),
    avatar: AvatarSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one user field must be provided',
  });

export type UpdateUserType = z.infer<typeof updateUserDto>;
