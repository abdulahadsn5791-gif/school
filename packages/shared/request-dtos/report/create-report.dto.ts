import { z } from 'zod';

import { idSchema } from '../../dtos';

export const subjectGradeInputSchema = z.object({
  subjectId: idSchema,
  homeworkMarks: z.coerce.number().min(0).max(1000).default(0),
  testMarks: z.coerce.number().min(0).max(1000).default(0),
  oralMarks: z.coerce.number().min(0).max(1000).default(0),
  totalObtained: z.coerce.number().min(0).max(1000),
  maxMarks: z.coerce.number().min(1).max(1000),
  grade: z.string().trim().min(1, 'Grade is required').max(10),
  teacherRemarks: z.string().trim().max(500).nullable().optional(),
});

export const createReportDto = z
  .object({
    schoolId: idSchema,
    studentId: idSchema,
    classId: idSchema,
    termId: idSchema,
    academicYear: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{4}$/, 'Academic year must look like 2026-2027'),
    subjects: z.array(subjectGradeInputSchema).min(1, 'At least one subject grade is required'),
    overallPercentage: z.coerce.number().min(0).max(100),
    overallGrade: z.string().trim().min(1, 'Overall grade is required').max(10),
    attendancePercentage: z.coerce.number().min(0).max(100).nullable().optional(),
    generalRemarks: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((data) => new Set(data.subjects.map((s) => s.subjectId)).size === data.subjects.length, {
    message: 'Each subject may appear only once',
    path: ['subjects'],
  });

export type CreateReportType = z.infer<typeof createReportDto>;
