import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);

export const attendanceEntrySchema = z.object({
  studentId: idSchema,
  status: attendanceStatusSchema,
  remark: z.string().trim().max(300).nullable().optional(),
});

export type AttendanceEntry = z.infer<typeof attendanceEntrySchema>;

export const markAttendanceDto = z.object({
  schoolId: idSchema,
  classId: idSchema,
  date: z.coerce.date(),
  subjectId: idSchema.nullable().optional(),
  periodId: idSchema.nullable().optional(),
  entries: z.array(attendanceEntrySchema).min(1, 'At least one student entry is required'),
});

export type MarkAttendanceType = z.infer<typeof markAttendanceDto>;

export const updateAttendanceDto = z.object({
  attendanceId: idSchema,
  status: attendanceStatusSchema,
  remark: z.string().trim().max(300).nullable().optional(),
});

export type UpdateAttendanceType = z.infer<typeof updateAttendanceDto>;

export const attendanceIdDto = z.object({
  attendanceId: idSchema,
});

export type AttendanceIdType = z.infer<typeof attendanceIdDto>;

export const deleteAttendanceDto = z.object({
  attendanceId: idSchema,
  reason: reasonSchema,
});

export type DeleteAttendanceType = z.infer<typeof deleteAttendanceDto>;

export const getAttendanceDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  classId: idSchema.optional(),
  studentId: idSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  status: attendanceStatusSchema.optional(),
});

export type GetAttendanceType = z.infer<typeof getAttendanceDto>;
