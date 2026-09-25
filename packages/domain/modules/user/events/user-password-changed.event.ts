import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class UserPasswordChangedEvent implements IEvent<{ userId: Id }> {
  readonly type = 'user.password-changed';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { userId: Id }) {}
}
