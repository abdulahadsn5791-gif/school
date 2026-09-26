import type { Id } from '../../value-objects';

type CreateAuditLogProps = {
  id: Id;
  schoolId: Id | null;
  actorId: Id | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  at: Date;
};

/**
 * Append-only audit record. No update/delete/recover by design —
 * the log must remain immutable. Events are not raised: audit entries
 * are typically written FROM domain event handlers.
 */
export class AuditLogAggregate {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id | null,
    private readonly _actorId: Id | null,
    private readonly _action: string,
    private readonly _entityType: string,
    private readonly _entityId: string,
    private readonly _metadata: Record<string, unknown> | null,
    private readonly _at: Date,
  ) {}

  get id() {
    return this._id;
  }
  get schoolId() {
    return this._schoolId;
  }
  get actorId() {
    return this._actorId;
  }
  get action() {
    return this._action;
  }
  get entityType() {
    return this._entityType;
  }
  get entityId() {
    return this._entityId;
  }
  get metadata() {
    return this._metadata;
  }
  get at() {
    return this._at;
  }

  static create(props: CreateAuditLogProps): AuditLogAggregate {
    if (props.action.trim().length === 0) {
      throw new Error('Audit action is required.');
    }
    if (props.entityType.trim().length === 0 || props.entityId.trim().length === 0) {
      throw new Error('Audit entity type and id are required.');
    }
    return new AuditLogAggregate(
      props.id,
      props.schoolId,
      props.actorId,
      props.action.trim().toUpperCase(),
      props.entityType.trim(),
      props.entityId,
      props.metadata,
      props.at,
    );
  }

  static rehydrate(
    id: Id,
    schoolId: Id | null,
    actorId: Id | null,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown> | null,
    at: Date,
  ): AuditLogAggregate {
    return new AuditLogAggregate(id, schoolId, actorId, action, entityType, entityId, metadata, at);
  }
}
