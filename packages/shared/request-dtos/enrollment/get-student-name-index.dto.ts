import { z } from 'zod';

/** Comma-separated class ids for the batched student-name index (new.md §6). */
export const getStudentNameIndexDto = z.object({
  classIds: z.string().optional(),
});

export type GetStudentNameIndexType = z.infer<typeof getStudentNameIndexDto>;
