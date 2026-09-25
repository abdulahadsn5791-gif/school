import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 11. FEE STRUCTURE / INVOICE / PAYMENT
// ---------------------------------------------------------------------------

const feeStructureSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    classId: { type: String, ref: 'Class', required: true },
    academicYear: { type: String, required: true },
    title: { type: String, required: true }, // e.g. "Tuition Fee - Term 1"
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME'],
      required: true,
    },
    dueDayOfMonth: { type: Number, default: null },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

feeStructureSchema.index({ schoolId: 1, classId: 1, academicYear: 1 });

const invoiceSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    studentId: { type: String, ref: 'User', required: true },
    feeStructureId: { type: String, ref: 'FeeStructure', required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'],
      default: 'UNPAID',
      required: true,
    },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

invoiceSchema.index({ studentId: 1, dueDate: 1 });
invoiceSchema.index({ schoolId: 1, status: 1 });

const paymentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    invoiceId: { type: String, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE'],
      required: true,
    },
    reference: { type: String, default: null },
    paidAt: { type: Date, required: true, default: Date.now },
    receivedBy: { type: String, ref: 'User', default: null },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

paymentSchema.index({ invoiceId: 1 });

export type FeeStructurePersistence = InferSchemaType<typeof feeStructureSchema>;
export type FeeStructureDocument = HydratedDocument<FeeStructurePersistence>;
export const FeeStructureModel = mongoose.model<FeeStructurePersistence>(
  'FeeStructure',
  feeStructureSchema,
);

export type InvoicePersistence = InferSchemaType<typeof invoiceSchema>;
export type InvoiceDocument = HydratedDocument<InvoicePersistence>;
export const InvoiceModel = mongoose.model<InvoicePersistence>('Invoice', invoiceSchema);

export type PaymentPersistence = InferSchemaType<typeof paymentSchema>;
export type PaymentDocument = HydratedDocument<PaymentPersistence>;
export const PaymentModel = mongoose.model<PaymentPersistence>('Payment', paymentSchema);
