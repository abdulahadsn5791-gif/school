import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type ClassMessagesType = { message: string };
export const ClassMessages = {
  create(id: Id): ClassMessagesType {
    return { message: `Class ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): ClassMessagesType {
    return { message: `Class ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): ClassMessagesType {
    return { message: `Class ${id.value} was recovered by ${actor.value}.` };
  },
  assignTeacher(id: Id, actor: Id): ClassMessagesType {
    return { message: `Class ${id.value} teacher was updated by ${actor.value}.` };
  },
};
