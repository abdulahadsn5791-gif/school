import { z } from 'zod';
import { PasswordSchema } from '../../dtos';

export const changePasswordDto = z.object({
  currentPassword: PasswordSchema,
  newPassword: PasswordSchema,
});

export type ChangePasswordType = z.infer<typeof changePasswordDto>;
