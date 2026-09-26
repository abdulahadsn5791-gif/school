import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type EventMessagesType = { message: string };
export const EventMessages = {
  create(id: Id): EventMessagesType {
    return { message: `Event ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): EventMessagesType {
    return { message: `Event ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): EventMessagesType {
    return { message: `Event ${id.value} was recovered by ${actor.value}.` };
  },
};
