import { z } from 'zod';
import { imageInputSchema } from './image-input-schema';
import { nameSchema, optionalNameSchema } from './name-schema';

export const UserRoleSchema = z.enum(['teacher', 'student', 'admin'], {
  message: 'Role must be teacher, student, or admin',
});
export type UserRoleDto = z.infer<typeof UserRoleSchema>;

/**
 * Plaintext password policy. Argon2 truncates inputs at 72 bytes, so the
 * upper bound intentionally mirrors that limit to avoid silently different
 * hashes.
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/\d/, 'Password must contain at least one number');

export type PasswordType = z.infer<typeof PasswordSchema>;

export const AvatarSchema = z.union([imageInputSchema, z.null()]);
export type AvatarType = z.infer<typeof AvatarSchema>;
export const optionalAvatarSchema = AvatarSchema.optional();
export type OptionalAvatarType = z.infer<typeof optionalAvatarSchema>;

export const NameInfoSchema = z.object({
  firstName: nameSchema,
  middleName: optionalNameSchema,
  lastName: optionalNameSchema,
});
export type NameInfoDto = z.infer<typeof NameInfoSchema>;

export const optionalNameInfoSchema = NameInfoSchema.optional();
export type optionalNameInfoType = z.infer<typeof optionalNameInfoSchema>;

export const BanDaysSchema = z
  .number()
  .int('Days must be a whole number')
  .min(1, 'Ban must last at least 1 day')
  .max(365, 'Ban cannot exceed 365 days');
export type BanDaysType = z.infer<typeof BanDaysSchema>;
