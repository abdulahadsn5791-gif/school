import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type NoticeMessagesType = { message: string };
export const NoticeMessages = {
  create(id: Id): NoticeMessagesType {
    return { message: `Notice ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): NoticeMessagesType {
    return { message: `Notice ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): NoticeMessagesType {
    return { message: `Notice ${id.value} was recovered by ${actor.value}.` };
  },
};
