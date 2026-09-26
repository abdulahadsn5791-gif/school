import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReportDeletedEvent implements IEvent<{ reportId: Id }> {
  readonly type = 'report.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reportId: Id }) {}
}
