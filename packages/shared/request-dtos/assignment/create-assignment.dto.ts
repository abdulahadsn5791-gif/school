import { z } from 'zod';

import { idSchema } from '../../dtos';

export const assignmentTypeSchema = z.enum(['homework', 'test', 'oral']);

export type AssignmentType = z.infer<typeof assignmentTypeSchema>;

export const createAssignmentDto = z
  .object({
    schoolId: idSchema,
    title: z
      .string()
      .trim()
      .min(3, 'Assignment title must be at least 3 characters')
      .max(150, 'Assignment title cannot exceed 150 characters'),
    description: z.string().trim().max(2000).optional(),
    type: assignmentTypeSchema,
    classId: idSchema,
    subjectId: idSchema,
    // Optional: a teacher's assignments are always attributed to the authenticated
    // actor, so only admins need to supply this.
    teacherId: idSchema.optional(),
    assignedDate: z.coerce.date().optional(),
    dueDate: z.coerce.date(),
    totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1').max(1000).optional(),
    attachments: z.array(z.string().trim().max(300)).max(10).optional(),
  })
  .refine(
    (data) =>
      data.assignedDate === undefined || data.dueDate.getTime() >= data.assignedDate.getTime(),
    { message: 'Due date cannot be before the assigned date', path: ['dueDate'] },
  );

export type CreateAssignmentType = z.infer<typeof createAssignmentDto>;
