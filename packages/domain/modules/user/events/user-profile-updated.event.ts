import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class UserProfileUpdatedEvent implements IEvent<{ userId: Id }> {
  readonly type = 'user.profile-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { userId: Id }) {}
}
