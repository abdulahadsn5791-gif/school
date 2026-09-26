import type {
  CreateFeeStructureType,
  DeleteFeeStructureType,
  FeeStructureListResponseDto,
  FeeStructureResponseDto,
  GetFeeStructuresType,
  GetInvoicesType,
  GetPaymentsType,
  InvoiceListResponseDto,
  InvoiceResponseDto,
  IssueInvoiceType,
  PaymentListResponseDto,
  PaymentResponseDto,
  RecordPaymentType,
  WaiveInvoiceType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class FeeService {
  // ── Structures ────────────────────────────────────────────────────────────

  getStructures(params: GetFeeStructuresType): Promise<FeeStructureListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params.frequency) searchParams.set('frequency', params.frequency);
    const query = searchParams.toString();
    return http.get<FeeStructureListResponseDto>(`/fees/fee-structures${query ? `?${query}` : ''}`);
  }

  getStructureById(id: string): Promise<FeeStructureResponseDto> {
    return http.get<FeeStructureResponseDto>(`/fees/fee-structures/${id}`);
  }

  createStructure(data: CreateFeeStructureType): Promise<FeeStructureResponseDto> {
    return http.post<FeeStructureResponseDto>('/fees/fee-structures', data);
  }

  deleteStructure(data: DeleteFeeStructureType): Promise<void> {
    return http.delete<void>('/fees/fee-structures/soft', data);
  }

  // ── Invoices ──────────────────────────────────────────────────────────────

  getInvoices(params: GetInvoicesType): Promise<InvoiceListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.studentId) searchParams.set('studentId', params.studentId);
    if (params.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return http.get<InvoiceListResponseDto>(`/fees/invoices${query ? `?${query}` : ''}`);
  }

  getInvoiceById(id: string): Promise<InvoiceResponseDto> {
    return http.get<InvoiceResponseDto>(`/fees/invoices/${id}`);
  }

  issueInvoice(data: IssueInvoiceType): Promise<InvoiceResponseDto> {
    return http.post<InvoiceResponseDto>('/fees/invoices', data);
  }

  waiveInvoice(data: WaiveInvoiceType): Promise<InvoiceResponseDto> {
    return http.patch<InvoiceResponseDto>('/fees/invoices/waive', data);
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  getPayments(params: GetPaymentsType): Promise<PaymentListResponseDto> {
    return http.get<PaymentListResponseDto>(
      `/fees/payments?invoiceId=${encodeURIComponent(params.invoiceId)}`,
    );
  }

  recordPayment(data: RecordPaymentType): Promise<PaymentResponseDto> {
    return http.post<PaymentResponseDto>('/fees/payments', data);
  }
}

export const feeService = new FeeService();
