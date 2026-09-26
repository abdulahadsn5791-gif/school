import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type ReportMessagesType = { message: string };
export const ReportMessages = {
  create(id: Id): ReportMessagesType {
    return { message: `Report ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): ReportMessagesType {
    return { message: `Report ${id.value} was deleted by ${actor.value}.` };
  },
};
