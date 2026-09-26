import type { Id } from '../../../value-objects';
import type { FeeStructureAggregate, InvoiceAggregate, PaymentAggregate } from '../fee.aggregate';

export interface IFeeRepository {
  // Fee structure
  FindStructureById(id: Id): Promise<FeeStructureAggregate | null>;
  FindStructureByIdOrThrow(id: Id): Promise<FeeStructureAggregate>;
  FindStructuresBySchoolAndYear(
    schoolId: Id,
    academicYear: string,
  ): Promise<FeeStructureAggregate[]>;
  SaveStructure(structure: FeeStructureAggregate): Promise<void>;
  CreateStructure(structure: FeeStructureAggregate): Promise<void>;

  // Invoice
  FindInvoiceById(id: Id): Promise<InvoiceAggregate | null>;
  FindInvoiceByIdOrThrow(id: Id): Promise<InvoiceAggregate>;
  FindInvoicesByStudent(studentId: Id): Promise<InvoiceAggregate[]>;
  FindInvoiceByStudentAndStructure(
    studentId: Id,
    feeStructureId: Id,
  ): Promise<InvoiceAggregate | null>;
  SaveInvoice(invoice: InvoiceAggregate): Promise<void>;
  CreateInvoice(invoice: InvoiceAggregate): Promise<void>;

  // Payment
  FindPaymentById(id: Id): Promise<PaymentAggregate | null>;
  FindPaymentByIdOrThrow(id: Id): Promise<PaymentAggregate>;
  FindPaymentsByInvoice(invoiceId: Id): Promise<PaymentAggregate[]>;
  CreatePayment(payment: PaymentAggregate): Promise<void>;

  Exists(id: Id): Promise<boolean>;
  Delete(id: Id): Promise<void>;
}
