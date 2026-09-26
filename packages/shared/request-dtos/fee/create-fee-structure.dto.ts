import { z } from 'zod';

import { idSchema } from '../../dtos';

export const feeFrequencySchema = z.enum(['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME']);

export const createFeeStructureDto = z.object({
  schoolId: idSchema,
  classId: idSchema,
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must look like 2026-2027'),
  title: z
    .string()
    .trim()
    .min(3, 'Fee title must be at least 3 characters')
    .max(150, 'Fee title cannot exceed 150 characters'),
  amount: z.coerce.number().positive('Fee amount must be greater than 0'),
  frequency: feeFrequencySchema,
  dueDayOfMonth: z.coerce.number().int().min(1).max(28).nullable().optional(),
});

export type CreateFeeStructureType = z.infer<typeof createFeeStructureDto>;

export const issueInvoiceDto = z.object({
  schoolId: idSchema,
  studentId: idSchema,
  feeStructureId: idSchema,
  dueDate: z.coerce.date(),
});

export type IssueInvoiceType = z.infer<typeof issueInvoiceDto>;

export const recordPaymentDto = z.object({
  invoiceId: idSchema,
  amount: z.coerce.number().positive('Payment amount must be greater than 0'),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE']),
  reference: z.string().trim().max(100).nullable().optional(),
});

export type RecordPaymentType = z.infer<typeof recordPaymentDto>;

export const waiveInvoiceDto = z.object({
  invoiceId: idSchema,
});

export type WaiveInvoiceType = z.infer<typeof waiveInvoiceDto>;
