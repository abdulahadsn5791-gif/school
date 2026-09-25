import { z } from 'zod';
import { idSchema, reasonSchema, UserRoleSchema } from '../../dtos';

export const assignUserRoleDto = z.object({
  userId: idSchema,
  role: UserRoleSchema,
  reason: reasonSchema,
});

export type AssignUserRoleType = z.infer<typeof assignUserRoleDto>;
