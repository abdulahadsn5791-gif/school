import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReportCreatedEvent implements IEvent<{ reportId: Id; studentId: Id }> {
  readonly type = 'report.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reportId: Id; studentId: Id }) {}
}
