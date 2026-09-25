import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';
import type { AvatarVO } from '../value-objects/avatar.vo';

export class UserAvatarUpdatedEvent implements IEvent<{ userId: Id; avatar: AvatarVO }> {
  readonly type = 'user.avatar-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { userId: Id; avatar: AvatarVO }) {}
}
