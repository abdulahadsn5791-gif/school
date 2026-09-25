import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class UserRecoveredEvent implements IEvent<{ userId: Id; recoverInfo: DeleteInfoVO }> {
  readonly type = 'user.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { userId: Id; recoverInfo: DeleteInfoVO }) {}
}
