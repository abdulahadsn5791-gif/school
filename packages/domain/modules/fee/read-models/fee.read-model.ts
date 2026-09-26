export type FeeStructureReadModel = {
  id: string;
  schoolId: string;
  classId: string;
  academicYear: string;
  title: string;
  amount: number;
  frequency: 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME';
  dueDayOfMonth: number | null;
  isDeleted: boolean;
  createdAt: Date;
};

export type InvoiceReadModel = {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  dueDate: Date;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED';
  isDeleted: boolean;
  createdAt: Date;
};

export type PaymentReadModel = {
  id: string;
  schoolId: string;
  invoiceId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE';
  reference: string | null;
  paidAt: Date;
  receivedBy: string | null;
  isDeleted: boolean;
  createdAt: Date;
};
