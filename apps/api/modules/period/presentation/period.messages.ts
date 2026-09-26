import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type PeriodMessagesType = { message: string };
export const PeriodMessages = {
  create(id: Id): PeriodMessagesType {
    return { message: `Period ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): PeriodMessagesType {
    return { message: `Period ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): PeriodMessagesType {
    return { message: `Period ${id.value} was recovered by ${actor.value}.` };
  },
};
