import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { subjectGradeInputSchema } from './create-report.dto';

export const updateReportDto = z
  .object({
    reportId: idSchema,
    subjects: z.array(subjectGradeInputSchema).min(1).optional(),
    overallPercentage: z.coerce.number().min(0).max(100).optional(),
    overallGrade: z.string().trim().min(1).max(10).optional(),
    attendancePercentage: z.coerce.number().min(0).max(100).nullable().optional(),
    generalRemarks: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field must be provided to update',
  });

export type UpdateReportType = z.infer<typeof updateReportDto>;

export const reportIdDto = z.object({
  reportId: idSchema,
});

export type ReportIdType = z.infer<typeof reportIdDto>;

export const deleteReportDto = z.object({
  reportId: idSchema,
  reason: reasonSchema,
});

export type DeleteReportType = z.infer<typeof deleteReportDto>;

export const getReportsDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  studentId: idSchema.optional(),
  classId: idSchema.optional(),
  termId: idSchema.optional(),
  academicYear: z.string().trim().optional(),
});

export type GetReportsType = z.infer<typeof getReportsDto>;
