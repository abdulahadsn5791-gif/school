import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { FeeInvoiceIssuedEvent } from './events/fee-invoice-issued.event';
import { FeeStructureCreatedEvent } from './events/fee-structure-created.event';

export type FeeFrequency = 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE';

export type InvoiceProps = {
  id: Id;
  schoolId: Id;
  studentId: Id;
  feeStructureId: Id;
  amountDue: number;
  amountPaid: number;
  dueDate: Date;
  status: InvoiceStatus;
};

type CreateFeeStructureProps = {
  id: Id;
  schoolId: Id;
  classId: Id;
  academicYear: string;
  title: string;
  amount: number;
  frequency: FeeFrequency;
  dueDayOfMonth: number | null;
};

export class FeeStructureAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _classId: Id,
    private readonly _academicYear: string,
    private _title: Title,
    private _amount: number,
    private _frequency: FeeFrequency,
    private _dueDayOfMonth: number | null,
    private _deleted: DeleteInfoVO,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get schoolId() {
    return this._schoolId;
  }
  get classId() {
    return this._classId;
  }
  get academicYear() {
    return this._academicYear;
  }
  get title() {
    return this._title;
  }
  get amount() {
    return this._amount;
  }
  get frequency() {
    return this._frequency;
  }
  get dueDayOfMonth() {
    return this._dueDayOfMonth;
  }
  get deleted() {
    return this._deleted;
  }
  get version() {
    return this._version;
  }
  get isDeleted(): boolean {
    return this._deleted.isDeleted;
  }

  static create(props: CreateFeeStructureProps): FeeStructureAggregate {
    if (!Number.isFinite(props.amount) || props.amount <= 0) {
      throw new BadRequestError('Fee amount must be greater than 0.');
    }
    if (props.dueDayOfMonth !== null && (props.dueDayOfMonth < 1 || props.dueDayOfMonth > 28)) {
      throw new BadRequestError('Due day of month must be between 1 and 28.');
    }

    const structure = new FeeStructureAggregate(
      props.id,
      props.schoolId,
      props.classId,
      props.academicYear,
      Title.create(props.title),
      props.amount,
      props.frequency,
      props.dueDayOfMonth,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    structure.raise(
      new FeeStructureCreatedEvent({ structureId: structure._id, schoolId: props.schoolId }),
    );
    return structure;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    classId: Id,
    academicYear: string,
    title: string,
    amount: number,
    frequency: FeeFrequency,
    dueDayOfMonth: number | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): FeeStructureAggregate {
    return new FeeStructureAggregate(
      id,
      schoolId,
      classId,
      academicYear,
      Title.rehydrate(title),
      amount,
      frequency,
      dueDayOfMonth,
      deleted,
      version,
    );
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This fee structure has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
  }
}

export class InvoiceAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _studentId: Id,
    private readonly _feeStructureId: Id,
    private _amountDue: number,
    private _amountPaid: number,
    private _dueDate: Date,
    private _status: InvoiceStatus,
    private _deleted: DeleteInfoVO,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get schoolId() {
    return this._schoolId;
  }
  get studentId() {
    return this._studentId;
  }
  get feeStructureId() {
    return this._feeStructureId;
  }
  get amountDue() {
    return this._amountDue;
  }
  get amountPaid() {
    return this._amountPaid;
  }
  get dueDate() {
    return this._dueDate;
  }
  get status() {
    return this._status;
  }
  get deleted() {
    return this._deleted;
  }
  get version() {
    return this._version;
  }
  get isDeleted(): boolean {
    return this._deleted.isDeleted;
  }

  get balance(): number {
    return this._amountDue - this._amountPaid;
  }

  static issue(props: {
    id: Id;
    schoolId: Id;
    studentId: Id;
    feeStructureId: Id;
    amountDue: number;
    dueDate: Date;
  }): InvoiceAggregate {
    if (!Number.isFinite(props.amountDue) || props.amountDue <= 0) {
      throw new BadRequestError('Invoice amount due must be greater than 0.');
    }
    const invoice = new InvoiceAggregate(
      props.id,
      props.schoolId,
      props.studentId,
      props.feeStructureId,
      props.amountDue,
      0,
      props.dueDate,
      'UNPAID',
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    invoice.raise(
      new FeeInvoiceIssuedEvent({ invoiceId: invoice._id, studentId: props.studentId }),
    );
    return invoice;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    studentId: Id,
    feeStructureId: Id,
    amountDue: number,
    amountPaid: number,
    dueDate: Date,
    status: InvoiceStatus,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): InvoiceAggregate {
    return new InvoiceAggregate(
      id,
      schoolId,
      studentId,
      feeStructureId,
      amountDue,
      amountPaid,
      dueDate,
      status,
      deleted,
      version,
    );
  }

  /** Apply a payment; status transitions UNPAID→PARTIAL→PAID. */
  applyPayment(amount: number): void {
    if (this._status === 'WAIVED') {
      throw new BadRequestError('A waived invoice cannot receive payments.');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestError('Payment amount must be greater than 0.');
    }
    if (amount > this.balance) {
      throw new BadRequestError('Payment exceeds the invoice balance.');
    }
    this._amountPaid += amount;
    this._status = this.balance === 0 ? 'PAID' : 'PARTIAL';
  }

  waive(): void {
    if (this._status === 'PAID') {
      throw new BadRequestError('A paid invoice cannot be waived.');
    }
    this._status = 'WAIVED';
  }

  /** Mark overdue (UNPAID/PARTIAL only, past due date) — called by app service after checking the clock. */
  markOverdue(now: Date): void {
    if (this._status !== 'UNPAID' && this._status !== 'PARTIAL') return;
    if (this._dueDate.getTime() > now.getTime()) return;
    this._status = 'OVERDUE';
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This invoice has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
  }
}

export class PaymentAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _invoiceId: Id,
    private _amount: number,
    private readonly _method: PaymentMethod,
    private _reference: string | null,
    private readonly _paidAt: Date,
    private readonly _receivedBy: Id | null,
    private _deleted: DeleteInfoVO,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get schoolId() {
    return this._schoolId;
  }
  get invoiceId() {
    return this._invoiceId;
  }
  get amount() {
    return this._amount;
  }
  get method() {
    return this._method;
  }
  get reference() {
    return this._reference;
  }
  get paidAt() {
    return this._paidAt;
  }
  get receivedBy() {
    return this._receivedBy;
  }
  get deleted() {
    return this._deleted;
  }
  get version() {
    return this._version;
  }
  get isDeleted(): boolean {
    return this._deleted.isDeleted;
  }

  static create(props: {
    id: Id;
    schoolId: Id;
    invoiceId: Id;
    amount: number;
    method: PaymentMethod;
    reference: string | null;
    paidAt: Date;
    receivedBy: Id | null;
  }): PaymentAggregate {
    if (!Number.isFinite(props.amount) || props.amount <= 0) {
      throw new BadRequestError('Payment amount must be greater than 0.');
    }
    return new PaymentAggregate(
      props.id,
      props.schoolId,
      props.invoiceId,
      props.amount,
      props.method,
      props.reference?.trim() || null,
      props.paidAt,
      props.receivedBy,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    invoiceId: Id,
    amount: number,
    method: PaymentMethod,
    reference: string | null,
    paidAt: Date,
    receivedBy: Id | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): PaymentAggregate {
    return new PaymentAggregate(
      id,
      schoolId,
      invoiceId,
      amount,
      method,
      reference,
      paidAt,
      receivedBy,
      deleted,
      version,
    );
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This payment has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
  }
}
