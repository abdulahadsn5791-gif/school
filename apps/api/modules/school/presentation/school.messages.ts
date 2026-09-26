import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type SchoolMessagesType = { message: string };
export const SchoolMessages = {
  create(id: Id): SchoolMessagesType {
    return { message: `School ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): SchoolMessagesType {
    return { message: `School ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): SchoolMessagesType {
    return { message: `School ${id.value} was recovered by ${actor.value}.` };
  },
  updateProfile(id: Id, actor: Id): SchoolMessagesType {
    return { message: `School ${id.value} profile was updated by ${actor.value}.` };
  },
};
