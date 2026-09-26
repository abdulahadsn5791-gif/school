import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type FeeMessagesType = { message: string };
export const FeeMessages = {
  createStructure(id: Id): FeeMessagesType {
    return { message: `Fee structure ${id.value} was created successfully.` };
  },
  deleteStructure(id: Id, actor: Id): FeeMessagesType {
    return { message: `Fee structure ${id.value} was deleted by ${actor.value}.` };
  },
  invoiceIssued(id: Id): FeeMessagesType {
    return { message: `Invoice ${id.value} was issued successfully.` };
  },
  invoiceWaived(id: Id): FeeMessagesType {
    return { message: `Invoice ${id.value} was waived.` };
  },
  paymentRecorded(id: Id, amount: number): FeeMessagesType {
    return { message: `Payment ${id.value} of ${amount} was recorded.` };
  },
};
