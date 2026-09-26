import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const updateAssignmentDto = z
  .object({
    assignmentId: idSchema,
    title: z
      .string()
      .trim()
      .min(3, 'Assignment title must be at least 3 characters')
      .max(150, 'Assignment title cannot exceed 150 characters')
      .optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    dueDate: z.coerce.date().optional(),
    totalMarks: z.coerce.number().min(1).max(1000).optional(),
    attachments: z.array(z.string().trim().max(300)).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field must be provided to update',
  });

export type UpdateAssignmentType = z.infer<typeof updateAssignmentDto>;

export const assignmentIdDto = z.object({
  assignmentId: idSchema,
});

export type AssignmentIdType = z.infer<typeof assignmentIdDto>;

export const deleteAssignmentDto = z.object({
  assignmentId: idSchema,
  reason: reasonSchema,
});

export type DeleteAssignmentType = z.infer<typeof deleteAssignmentDto>;
