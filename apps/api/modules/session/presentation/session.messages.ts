import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type SessionMessagesType = { message: string };
export const SessionMessages = {
  issue(id: Id): SessionMessagesType {
    return { message: `Session ${id.value} was issued successfully.` };
  },
  revoke(id: Id, actor: Id): SessionMessagesType {
    return { message: `Session ${id.value} was revoked by ${actor.value}.` };
  },
  revokeAll(userId: Id, actor: Id, count: number): SessionMessagesType {
    return {
      message: `${count} session(s) of user ${userId.value} were revoked by ${actor.value}.`,
    };
  },
};
