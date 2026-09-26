import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type StudentTestMessagesType = { message: string };
export const StudentTestMessages = {
  created(id: Id): StudentTestMessagesType {
    return { message: `Submission ${id.value} was created successfully.` };
  },
  submitted(id: Id): StudentTestMessagesType {
    return { message: `Submission ${id.value} was submitted.` };
  },
  graded(id: Id): StudentTestMessagesType {
    return { message: `Submission ${id.value} was graded.` };
  },
  delete(id: Id, actor: Id): StudentTestMessagesType {
    return { message: `Submission ${id.value} was deleted by ${actor.value}.` };
  },
};
