import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { leaveStatusSchema } from './submit-leave.dto';

export const reviewLeaveDto = z.object({
  leaveId: idSchema,
  remark: z.string().trim().max(300).nullable().optional(),
});

export type ReviewLeaveType = z.infer<typeof reviewLeaveDto>;

export const leaveIdDto = z.object({
  leaveId: idSchema,
});

export type LeaveIdType = z.infer<typeof leaveIdDto>;

export const deleteLeaveDto = z.object({
  leaveId: idSchema,
  reason: reasonSchema,
});

export type DeleteLeaveType = z.infer<typeof deleteLeaveDto>;

export const getLeavesDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  applicantId: idSchema.optional(),
  status: leaveStatusSchema.optional(),
});

export type GetLeavesType = z.infer<typeof getLeavesDto>;
