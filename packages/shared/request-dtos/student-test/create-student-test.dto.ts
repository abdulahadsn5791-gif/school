import { z } from 'zod';

import { idSchema } from '../../dtos';

export const studentTestStatusSchema = z.enum(['PENDING', 'SUBMITTED', 'GRADED', 'MISSED']);

export const createStudentTestDto = z.object({
  schoolId: idSchema,
  assignmentId: idSchema,
  studentId: idSchema,
});

export type CreateStudentTestType = z.infer<typeof createStudentTestDto>;

export const submitStudentTestDto = z
  .object({
    studentTestId: idSchema,
    submissionText: z.string().trim().max(10000).nullable().optional(),
    submissionFiles: z.array(z.string().trim().max(300)).max(10).optional(),
  })
  .refine(
    (data) =>
      (data.submissionText != null && data.submissionText.length > 0) ||
      (data.submissionFiles !== undefined && data.submissionFiles.length > 0),
    { message: 'Provide submission text or at least one file' },
  );

export type SubmitStudentTestType = z.infer<typeof submitStudentTestDto>;

export const gradeStudentTestDto = z.object({
  studentTestId: idSchema,
  marksObtained: z.coerce.number().min(0, 'Marks cannot be negative'),
  teacherFeedback: z.string().trim().max(2000).nullable().optional(),
});

export type GradeStudentTestType = z.infer<typeof gradeStudentTestDto>;

export const markMissedDto = z.object({
  studentTestId: idSchema,
});

export type MarkMissedType = z.infer<typeof markMissedDto>;
