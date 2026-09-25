import { z } from 'zod';
import { idSchema } from '../../dtos';

export const getUserByCursorDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  search: z.string().trim().optional(),
  direction: z.enum(['next', 'prev']).optional(),
});

export type GetUserByCursorType = z.infer<typeof getUserByCursorDto>;

export const getPaginatedUsersDto = getUserByCursorDto;

export type GetPaginatedUsersType = GetUserByCursorType;

export const getAdminPaginatedUsersDto = getUserByCursorDto.extend({
  role: z.enum(['teacher', 'student', 'admin']).optional(),
  deleted: z.coerce.boolean().optional(),
  blocked: z.coerce.boolean().optional(),
  banned: z.coerce.boolean().optional(),
});

export type GetAdminPaginatedUsersType = z.infer<typeof getAdminPaginatedUsersDto>;
