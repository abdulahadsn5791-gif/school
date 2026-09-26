import type {
  FeeStructureAggregate,
  Id,
  IFeeRepository,
  InvoiceAggregate,
  PaymentAggregate,
} from '@ecomerece/domain';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { FeeMapper } from './fee.mapper';
import {
  FeeStructureModel,
  type FeeStructurePersistence,
  InvoiceModel,
  PaymentModel,
} from './fee.models';

export class FeeRepository
  extends MongoRepository<FeeStructurePersistence>
  implements IFeeRepository
{
  constructor() {
    super(FeeStructureModel);
  }

  // ── Fee structure ──────────────────────────────────────────────────────────

  async FindStructureById(id: Id): Promise<FeeStructureAggregate | null> {
    const doc = await FeeStructureModel.findById(id.value).lean();
    return doc ? FeeMapper.structureToAggregate(doc) : null;
  }

  async FindStructureByIdOrThrow(id: Id): Promise<FeeStructureAggregate> {
    const doc = await FeeStructureModel.findById(id.value).lean();
    if (!doc) throw new NotFoundError('Fee structure not found.');
    return FeeMapper.structureToAggregate(doc);
  }

  async FindStructuresBySchoolAndYear(
    schoolId: Id,
    academicYear: string,
  ): Promise<FeeStructureAggregate[]> {
    const docs = await FeeStructureModel.find({
      schoolId: schoolId.value,
      academicYear,
    }).lean();
    return docs.map((doc) => FeeMapper.structureToAggregate(doc));
  }

  async SaveStructure(structure: FeeStructureAggregate): Promise<void> {
    const { _id, ...data } = FeeMapper.structureToPersistence(structure);
    await FeeStructureModel.updateOne({ _id }, { $set: data });
  }

  async CreateStructure(structure: FeeStructureAggregate): Promise<void> {
    const doc = new FeeStructureModel(FeeMapper.structureToPersistence(structure));
    await doc.save({ session: this.session });
  }

  // ── Invoice ────────────────────────────────────────────────────────────────

  async FindInvoiceById(id: Id): Promise<InvoiceAggregate | null> {
    const doc = await InvoiceModel.findById(id.value).lean();
    return doc ? FeeMapper.invoiceToAggregate(doc) : null;
  }

  async FindInvoiceByIdOrThrow(id: Id): Promise<InvoiceAggregate> {
    const doc = await InvoiceModel.findById(id.value).lean();
    if (!doc) throw new NotFoundError('Invoice not found.');
    return FeeMapper.invoiceToAggregate(doc);
  }

  async FindInvoicesByStudent(studentId: Id): Promise<InvoiceAggregate[]> {
    const docs = await InvoiceModel.find({ studentId: studentId.value }).lean();
    return docs.map((doc) => FeeMapper.invoiceToAggregate(doc));
  }

  async FindInvoiceByStudentAndStructure(
    studentId: Id,
    feeStructureId: Id,
  ): Promise<InvoiceAggregate | null> {
    const doc = await InvoiceModel.findOne({
      studentId: studentId.value,
      feeStructureId: feeStructureId.value,
    }).lean();
    return doc ? FeeMapper.invoiceToAggregate(doc) : null;
  }

  async SaveInvoice(invoice: InvoiceAggregate): Promise<void> {
    const { _id, ...data } = FeeMapper.invoiceToPersistence(invoice);
    await InvoiceModel.updateOne({ _id }, { $set: data });
  }

  async CreateInvoice(invoice: InvoiceAggregate): Promise<void> {
    const doc = new InvoiceModel(FeeMapper.invoiceToPersistence(invoice));
    await doc.save({ session: this.session });
  }

  // ── Payment ────────────────────────────────────────────────────────────────

  async FindPaymentById(id: Id): Promise<PaymentAggregate | null> {
    const doc = await PaymentModel.findById(id.value).lean();
    return doc ? FeeMapper.paymentToAggregate(doc) : null;
  }

  async FindPaymentByIdOrThrow(id: Id): Promise<PaymentAggregate> {
    const doc = await PaymentModel.findById(id.value).lean();
    if (!doc) throw new NotFoundError('Payment not found.');
    return FeeMapper.paymentToAggregate(doc);
  }

  async FindPaymentsByInvoice(invoiceId: Id): Promise<PaymentAggregate[]> {
    const docs = await PaymentModel.find({ invoiceId: invoiceId.value }).lean();
    return docs.map((doc) => FeeMapper.paymentToAggregate(doc));
  }

  async CreatePayment(payment: PaymentAggregate): Promise<void> {
    const doc = new PaymentModel(FeeMapper.paymentToPersistence(payment));
    await doc.save({ session: this.session });
  }

  // ── Shared ─────────────────────────────────────────────────────────────────

  async Exists(id: Id): Promise<boolean> {
    return !!(await FeeStructureModel.exists({ _id: id.value }));
  }

  async Delete(id: Id): Promise<void> {
    await FeeStructureModel.findByIdAndDelete(id.value);
  }
}
