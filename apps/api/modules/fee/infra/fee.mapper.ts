import {
  DeleteInfoVO,
  EffectiveDate,
  FeeStructureAggregate,
  type FeeStructureReadModel,
  Id,
  InvoiceAggregate,
  type InvoiceReadModel,
  PaymentAggregate,
  type PaymentReadModel,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { FeeStructurePersistence, InvoicePersistence, PaymentPersistence } from './fee.models';

export const FeeMapper = {
  structureToAggregate(doc: FeeStructurePersistence): FeeStructureAggregate {
    return FeeStructureAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.classId),
      doc.academicYear,
      doc.title,
      doc.amount,
      doc.frequency,
      doc.dueDayOfMonth ?? null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  structureToPersistence(structure: FeeStructureAggregate) {
    return {
      _id: structure.id.value,
      schoolId: structure.schoolId.value,
      classId: structure.classId.value,
      academicYear: structure.academicYear,
      title: structure.title.value,
      amount: structure.amount,
      frequency: structure.frequency,
      dueDayOfMonth: structure.dueDayOfMonth,
      deleted: {
        deleted: structure.deleted.isDeleted,
        at: structure.deleted.from?.value ?? null,
        by: structure.deleted.performedBy?.value ?? null,
        reason: structure.deleted.reason?.value ?? null,
      },
    };
  },

  structureToReadModel(structure: FeeStructureAggregate): FeeStructureReadModel {
    return {
      id: structure.id.value,
      schoolId: structure.schoolId.value,
      classId: structure.classId.value,
      academicYear: structure.academicYear,
      title: structure.title.value,
      amount: structure.amount,
      frequency: structure.frequency,
      dueDayOfMonth: structure.dueDayOfMonth,
      isDeleted: structure.isDeleted,
      createdAt: new Date(),
    };
  },

  invoiceToAggregate(doc: InvoicePersistence): InvoiceAggregate {
    return InvoiceAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.studentId),
      Id.rehydrate(doc.feeStructureId),
      doc.amountDue,
      doc.amountPaid,
      doc.dueDate,
      doc.status,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  invoiceToPersistence(invoice: InvoiceAggregate) {
    return {
      _id: invoice.id.value,
      schoolId: invoice.schoolId.value,
      studentId: invoice.studentId.value,
      feeStructureId: invoice.feeStructureId.value,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      dueDate: invoice.dueDate,
      status: invoice.status,
      deleted: {
        deleted: invoice.deleted.isDeleted,
        at: invoice.deleted.from?.value ?? null,
        by: invoice.deleted.performedBy?.value ?? null,
        reason: invoice.deleted.reason?.value ?? null,
      },
    };
  },

  invoiceToReadModel(invoice: InvoiceAggregate): InvoiceReadModel {
    return {
      id: invoice.id.value,
      schoolId: invoice.schoolId.value,
      studentId: invoice.studentId.value,
      feeStructureId: invoice.feeStructureId.value,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      balance: invoice.balance,
      dueDate: invoice.dueDate,
      status: invoice.status,
      isDeleted: invoice.isDeleted,
      createdAt: new Date(),
    };
  },

  paymentToAggregate(doc: PaymentPersistence): PaymentAggregate {
    return PaymentAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.invoiceId),
      doc.amount,
      doc.method,
      doc.reference ?? null,
      doc.paidAt,
      doc.receivedBy ? Id.rehydrate(doc.receivedBy) : null,
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  paymentToPersistence(payment: PaymentAggregate) {
    return {
      _id: payment.id.value,
      schoolId: payment.schoolId.value,
      invoiceId: payment.invoiceId.value,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference,
      paidAt: payment.paidAt,
      receivedBy: payment.receivedBy?.value ?? null,
      deleted: {
        deleted: payment.deleted.isDeleted,
        at: payment.deleted.from?.value ?? null,
        by: payment.deleted.performedBy?.value ?? null,
        reason: payment.deleted.reason?.value ?? null,
      },
    };
  },

  paymentToReadModel(payment: PaymentAggregate): PaymentReadModel {
    return {
      id: payment.id.value,
      schoolId: payment.schoolId.value,
      invoiceId: payment.invoiceId.value,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference,
      paidAt: payment.paidAt,
      receivedBy: payment.receivedBy?.value ?? null,
      isDeleted: payment.isDeleted,
      createdAt: new Date(),
    };
  },
};
