import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type SubjectMessagesType = { message: string };
export const SubjectMessages = {
  create(id: Id): SubjectMessagesType {
    return { message: `Subject ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): SubjectMessagesType {
    return { message: `Subject ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): SubjectMessagesType {
    return { message: `Subject ${id.value} was recovered by ${actor.value}.` };
  },
};
