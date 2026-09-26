import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type TimetableMessagesType = { message: string };
export const TimetableMessages = {
  create(id: Id): TimetableMessagesType {
    return { message: `Timetable entry ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): TimetableMessagesType {
    return { message: `Timetable entry ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): TimetableMessagesType {
    return { message: `Timetable entry ${id.value} was recovered by ${actor.value}.` };
  },
};
