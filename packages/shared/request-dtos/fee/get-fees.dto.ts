import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { feeFrequencySchema } from './create-fee-structure.dto';

export const getFeeStructuresDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  classId: idSchema.optional(),
  academicYear: z.string().trim().optional(),
  frequency: feeFrequencySchema.optional(),
});

export type GetFeeStructuresType = z.infer<typeof getFeeStructuresDto>;

export const getInvoicesDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  studentId: idSchema.optional(),
  status: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED']).optional(),
});

export type GetInvoicesType = z.infer<typeof getInvoicesDto>;

export const getPaymentsDto = z.object({
  invoiceId: idSchema,
});

export type GetPaymentsType = z.infer<typeof getPaymentsDto>;

export const feeStructureIdDto = z.object({
  feeStructureId: idSchema,
});

export type FeeStructureIdType = z.infer<typeof feeStructureIdDto>;

export const invoiceIdDto = z.object({
  invoiceId: idSchema,
});

export type InvoiceIdType = z.infer<typeof invoiceIdDto>;

export const deleteFeeStructureDto = z.object({
  feeStructureId: idSchema,
  reason: reasonSchema,
});

export type DeleteFeeStructureType = z.infer<typeof deleteFeeStructureDto>;
