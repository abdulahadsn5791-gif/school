import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const updateSubjectDto = z.object({
  subjectId: idSchema,
  name: z
    .string()
    .trim()
    .min(3, 'Subject name must be at least 3 characters')
    .max(100, 'Subject name cannot exceed 100 characters'),
});

export type UpdateSubjectType = z.infer<typeof updateSubjectDto>;

export const subjectIdDto = z.object({
  subjectId: idSchema,
});

export type SubjectIdType = z.infer<typeof subjectIdDto>;

export const deleteSubjectDto = z.object({
  subjectId: idSchema,
  reason: reasonSchema,
});

export type DeleteSubjectType = z.infer<typeof deleteSubjectDto>;
