import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type EnrollmentMessagesType = { message: string };
export const EnrollmentMessages = {
  create(id: Id): EnrollmentMessagesType {
    return { message: `Enrollment ${id.value} was created successfully.` };
  },
  delete(id: Id, actor: Id): EnrollmentMessagesType {
    return { message: `Enrollment ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): EnrollmentMessagesType {
    return { message: `Enrollment ${id.value} was recovered by ${actor.value}.` };
  },
  assignRoll(id: Id, rollNumber: string, actor: Id): EnrollmentMessagesType {
    return {
      message: `Roll number ${rollNumber} was assigned to enrollment ${id.value} by ${actor.value}.`,
    };
  },
};
