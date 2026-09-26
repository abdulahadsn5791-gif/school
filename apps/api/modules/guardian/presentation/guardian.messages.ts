import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type GuardianMessagesType = { message: string };
export const GuardianMessages = {
  create(id: Id): GuardianMessagesType {
    return { message: `Guardian ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): GuardianMessagesType {
    return { message: `Guardian ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): GuardianMessagesType {
    return { message: `Guardian ${id.value} was recovered by ${actor.value}.` };
  },
};
