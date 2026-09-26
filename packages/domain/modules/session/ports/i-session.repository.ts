import type { Id } from '../../../value-objects';
import type { SessionAggregate } from '../session.aggregate';

export interface ISessionRepository {
  FindById(id: Id): Promise<SessionAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<SessionAggregate>;
  /** All sessions of a user (active + revoked). */
  FindByUserId(userId: Id): Promise<SessionAggregate[]>;
  /** Non-revoked, non-expired sessions of a user. */
  FindActiveByUserId(userId: Id): Promise<SessionAggregate[]>;
  Save(session: SessionAggregate): Promise<void>;
  Create(session: SessionAggregate): Promise<void>;
  /** Revoke every active session of a user (e.g. password change). */
  RevokeAllForUser(userId: Id): Promise<number>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
