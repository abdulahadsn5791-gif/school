import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class NoticeCreatedEvent implements IEvent<{ noticeId: Id; schoolId: Id }> {
  readonly type = 'notice.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { noticeId: Id; schoolId: Id }) {}
}
