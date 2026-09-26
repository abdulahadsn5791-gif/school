import { z } from 'zod';

import { idSchema } from '../../dtos';
import { assignmentTypeSchema } from './create-assignment.dto';

export const getAssignmentsDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  classId: idSchema.optional(),
  teacherId: idSchema.optional(),
  subjectId: idSchema.optional(),
  type: assignmentTypeSchema.optional(),
});

export type GetAssignmentsType = z.infer<typeof getAssignmentsDto>;
