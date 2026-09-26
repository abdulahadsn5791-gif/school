import {
  FeeStructureAggregate,
  type FeeStructureReadModel,
  Id,
  type IEventBus,
  type IFeeRepository,
  InvoiceAggregate,
  type InvoiceReadModel,
  PaymentAggregate,
  type PaymentReadModel,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateFeeStructureType,
  DeleteFeeStructureType,
  GetFeeStructuresType,
  GetInvoicesType,
  IssueInvoiceType,
  RecordPaymentType,
} from '@ecomerece/shared';
import { ConflictError } from '../../../errors/app-error';
import { FeeMapper } from '../infra/fee.mapper';
import { FeeMessages } from '../presentation/fee.messages';

const EMPTY_META = { nextCursor: null, prevCursor: null, hasMore: false };

export class FeeAppService {
  constructor(
    private readonly feeRepo: IFeeRepository,
    private readonly eventBus: IEventBus,
  ) {}

  private async publishEvents(aggregates: { pullEvents: () => any[] }[]): Promise<void> {
    const events = aggregates.flatMap((aggregate) => aggregate.pullEvents());
    if (events.length > 0) await this.eventBus.publish(events);
  }

  // ── Fee structures ────────────────────────────────────────────────────────

  async createStructure(
    data: CreateFeeStructureType,
    _actor: { _id: string },
  ): Promise<FeeStructureReadModel> {
    const structure = FeeStructureAggregate.create({
      id: Id.create(),
      schoolId: Id.create(data.schoolId),
      classId: Id.create(data.classId),
      academicYear: data.academicYear,
      title: data.title,
      amount: data.amount,
      frequency: data.frequency,
      dueDayOfMonth: data.dueDayOfMonth ?? null,
    });

    await this.feeRepo.CreateStructure(structure);
    await this.publishEvents([structure]);
    return FeeMapper.structureToReadModel(structure);
  }

  async getStructure(feeStructureId: string): Promise<FeeStructureReadModel> {
    const structure = await this.feeRepo.FindStructureByIdOrThrow(Id.create(feeStructureId));
    return FeeMapper.structureToReadModel(structure);
  }

  async listStructures(query: GetFeeStructuresType): Promise<{
    data: FeeStructureReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    if (!query.schoolId) {
      return { data: [], meta: EMPTY_META };
    }
    const all = await this.feeRepo.FindStructuresBySchoolAndYear(
      Id.create(query.schoolId),
      query.academicYear ?? '',
    );
    const filtered = all.filter(
      (s) =>
        !s.isDeleted &&
        (!query.classId || s.classId.value === query.classId) &&
        (!query.frequency || s.frequency === query.frequency),
    );
    return {
      data: filtered.map((s) => FeeMapper.structureToReadModel(s)),
      meta: EMPTY_META,
    };
  }

  async softDeleteStructure(data: DeleteFeeStructureType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const structure = await this.feeRepo.FindStructureByIdOrThrow(Id.create(data.feeStructureId));
    structure.delete(actorId, Reason.create(data.reason));
    await this.feeRepo.SaveStructure(structure);
    return FeeMessages.deleteStructure(structure.id, actorId).message;
  }

  // ── Invoices ──────────────────────────────────────────────────────────────

  async issueInvoice(data: IssueInvoiceType, _actor: { _id: string }): Promise<InvoiceReadModel> {
    const structure = await this.feeRepo.FindStructureByIdOrThrow(Id.create(data.feeStructureId));
    if (structure.isDeleted) throw new ConflictError('This fee structure has been deleted.');

    const studentId = Id.create(data.studentId);
    const existing = await this.feeRepo.FindInvoiceByStudentAndStructure(studentId, structure.id);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('An invoice already exists for this student and fee structure.');
    }

    const invoice = InvoiceAggregate.issue({
      id: Id.create(),
      schoolId: structure.schoolId,
      studentId,
      feeStructureId: structure.id,
      amountDue: structure.amount,
      dueDate: data.dueDate,
    });
    await this.feeRepo.CreateInvoice(invoice);
    await this.publishEvents([invoice]);
    return FeeMapper.invoiceToReadModel(invoice);
  }

  async getInvoice(invoiceId: string): Promise<InvoiceReadModel> {
    const invoice = await this.feeRepo.FindInvoiceByIdOrThrow(Id.create(invoiceId));
    return FeeMapper.invoiceToReadModel(invoice);
  }

  async listInvoices(query: GetInvoicesType): Promise<{
    data: InvoiceReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    if (!query.studentId) {
      return { data: [], meta: EMPTY_META };
    }
    const all = await this.feeRepo.FindInvoicesByStudent(Id.create(query.studentId));
    const filtered = all.filter(
      (i) => !i.isDeleted && (!query.status || i.status === query.status),
    );
    return {
      data: filtered.map((i) => FeeMapper.invoiceToReadModel(i)),
      meta: EMPTY_META,
    };
  }

  async waiveInvoice(
    data: { invoiceId: string },
    _actor: { _id: string },
  ): Promise<InvoiceReadModel> {
    const invoice = await this.feeRepo.FindInvoiceByIdOrThrow(Id.create(data.invoiceId));
    if (invoice.isDeleted) throw new ConflictError('This invoice has been deleted.');
    invoice.waive();
    await this.feeRepo.SaveInvoice(invoice);
    return FeeMapper.invoiceToReadModel(invoice);
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  async recordPayment(data: RecordPaymentType, actor: { _id: string }): Promise<PaymentReadModel> {
    const invoice = await this.feeRepo.FindInvoiceByIdOrThrow(Id.create(data.invoiceId));
    if (invoice.isDeleted) throw new ConflictError('This invoice has been deleted.');

    invoice.applyPayment(data.amount);

    const payment = PaymentAggregate.create({
      id: Id.create(),
      schoolId: invoice.schoolId,
      invoiceId: invoice.id,
      amount: data.amount,
      method: data.method,
      reference: data.reference ?? null,
      paidAt: new Date(),
      receivedBy: Id.create(actor._id),
    });
    await this.feeRepo.CreatePayment(payment);
    await this.feeRepo.SaveInvoice(invoice);
    await this.publishEvents([payment, invoice]);
    return FeeMapper.paymentToReadModel(payment);
  }

  async listPayments(invoiceId: string): Promise<PaymentReadModel[]> {
    const payments = await this.feeRepo.FindPaymentsByInvoice(Id.create(invoiceId));
    return payments.filter((p) => !p.isDeleted).map((p) => FeeMapper.paymentToReadModel(p));
  }
}
