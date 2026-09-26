export type FeeStructureListResponseDto = {
  data: FeeStructureResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface FeeStructureResponseDto {
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
}

export type InvoiceListResponseDto = {
  data: InvoiceResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface InvoiceResponseDto {
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
}

export type PaymentListResponseDto = {
  data: PaymentResponseDto[];
};

export interface PaymentResponseDto {
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
}
