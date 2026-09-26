import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SessionIssuedEvent implements IEvent<{ sessionId: Id; userId: Id }> {
  readonly type = 'session.issued';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { sessionId: Id; userId: Id }) {}
}
