import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type LeaveMessagesType = { message: string };
export const LeaveMessages = {
  submitted(id: Id): LeaveMessagesType {
    return { message: `Leave application ${id.value} was submitted.` };
  },
  approved(id: Id, actor: Id): LeaveMessagesType {
    return { message: `Leave application ${id.value} was approved by ${actor.value}.` };
  },
  rejected(id: Id, actor: Id): LeaveMessagesType {
    return { message: `Leave application ${id.value} was rejected by ${actor.value}.` };
  },
  delete(id: Id, actor: Id): LeaveMessagesType {
    return { message: `Leave application ${id.value} was deleted by ${actor.value}.` };
  },
};
