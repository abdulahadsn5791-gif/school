import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type AcademicTermMessagesType = { message: string };
export const AcademicTermMessages = {
  create(id: Id): AcademicTermMessagesType {
    return { message: `Academic term ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): AcademicTermMessagesType {
    return { message: `Academic term ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): AcademicTermMessagesType {
    return { message: `Academic term ${id.value} was recovered by ${actor.value}.` };
  },
  markCurrent(id: Id, actor: Id): AcademicTermMessagesType {
    return { message: `Academic term ${id.value} was marked current by ${actor.value}.` };
  },
};
