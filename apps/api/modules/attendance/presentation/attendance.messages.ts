import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type AttendanceMessagesType = { message: string };
export const AttendanceMessages = {
  delete(id: Id, actor: Id): AttendanceMessagesType {
    return { message: `Attendance record ${id.value} was deleted by ${actor.value}.` };
  },
};
