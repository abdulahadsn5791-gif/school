import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SessionRevokedEvent implements IEvent<{ sessionId: Id }> {
  readonly type = 'session.revoked';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { sessionId: Id }) {}
}
