import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { type Id, Quantity } from '../../value-objects';
import { SessionIssuedEvent } from './events/session-issued.event';
import { SessionRevokedEvent } from './events/session-revoked.event';

type CreateSessionProps = {
  id: Id;
  userId: Id;
  tokenHash: string;
  userAgent: string | null;
  ip: string | null;
  expiresAt: Date;
};

/**
 * Refresh-token session. Lifecycle only (issue/revoke) — no soft delete,
 * TTL index on expiresAt removes expired documents.
 */
export class SessionAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _userId: Id,
    private readonly _tokenHash: string,
    private readonly _userAgent: string | null,
    private readonly _ip: string | null,
    private readonly _expiresAt: Date,
    private _revokedAt: Date | null,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }

  get userId() {
    return this._userId;
  }

  get tokenHash() {
    return this._tokenHash;
  }

  get userAgent() {
    return this._userAgent;
  }

  get ip() {
    return this._ip;
  }

  get expiresAt() {
    return this._expiresAt;
  }

  get revokedAt() {
    return this._revokedAt;
  }

  get version() {
    return this._version;
  }

  get isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  get isExpired(): boolean {
    return this._expiresAt.getTime() <= Date.now();
  }

  get isActive(): boolean {
    return !this.isRevoked && !this.isExpired;
  }

  static create(props: CreateSessionProps): SessionAggregate {
    if (props.tokenHash.trim().length < 16) {
      throw new BadRequestError('Token hash is missing or too short.');
    }
    if (props.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestError('Session expiry must be in the future.');
    }

    const session = new SessionAggregate(
      props.id,
      props.userId,
      props.tokenHash.trim(),
      props.userAgent?.trim() || null,
      props.ip?.trim() || null,
      props.expiresAt,
      null,
      Quantity.zero(),
    );
    session.raise(new SessionIssuedEvent({ sessionId: session._id, userId: props.userId }));
    return session;
  }

  static rehydrate(
    id: Id,
    userId: Id,
    tokenHash: string,
    userAgent: string | null,
    ip: string | null,
    expiresAt: Date,
    revokedAt: Date | null,
    version: Quantity,
  ): SessionAggregate {
    return new SessionAggregate(
      id,
      userId,
      tokenHash,
      userAgent,
      ip,
      expiresAt,
      revokedAt,
      version,
    );
  }

  revoke(): void {
    if (this._revokedAt !== null) return;
    this._revokedAt = new Date();
    this.raise(new SessionRevokedEvent({ sessionId: this._id }));
  }
}
