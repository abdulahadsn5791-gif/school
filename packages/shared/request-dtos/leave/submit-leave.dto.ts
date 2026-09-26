import { z } from 'zod';

import { idSchema } from '../../dtos';

export const leaveStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export type LeaveStatus = z.infer<typeof leaveStatusSchema>;

export const submitLeaveDto = z
  .object({
    schoolId: idSchema,
    applicantRole: z.enum(['student', 'teacher']),
    classId: idSchema.nullable().optional(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    reason: z
      .string()
      .trim()
      .min(10, 'Leave reason must be at least 10 characters')
      .max(500, 'Leave reason cannot exceed 500 characters'),
  })
  .refine((data) => data.applicantRole !== 'student' || data.classId != null, {
    message: 'A class is required for student leave applications',
    path: ['classId'],
  })
  .refine((data) => data.toDate.getTime() >= data.fromDate.getTime(), {
    message: 'Leave end date cannot be before the start date',
    path: ['toDate'],
  });

export type SubmitLeaveType = z.infer<typeof submitLeaveDto>;
