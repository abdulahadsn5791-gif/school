import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class NoticeUpdatedEvent implements IEvent<{ noticeId: Id }> {
  readonly type = 'notice.updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { noticeId: Id }) {}
}
