import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type AssignmentMessagesType = { message: string };
export const AssignmentMessages = {
  create(id: Id): AssignmentMessagesType {
    return { message: `Assignment ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): AssignmentMessagesType {
    return { message: `Assignment ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): AssignmentMessagesType {
    return { message: `Assignment ${id.value} was recovered by ${actor.value}.` };
  },
};
