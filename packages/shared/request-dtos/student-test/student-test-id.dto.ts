import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { studentTestStatusSchema } from './create-student-test.dto';

export const studentTestIdDto = z.object({
  studentTestId: idSchema,
});

export type StudentTestIdType = z.infer<typeof studentTestIdDto>;

export const deleteStudentTestDto = z.object({
  studentTestId: idSchema,
  reason: reasonSchema,
});

export type DeleteStudentTestType = z.infer<typeof deleteStudentTestDto>;

export const getStudentTestsDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  assignmentId: idSchema.optional(),
  studentId: idSchema.optional(),
  status: studentTestStatusSchema.optional(),
});

export type GetStudentTestsType = z.infer<typeof getStudentTestsDto>;
