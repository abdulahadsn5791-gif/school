import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class FeeStructureCreatedEvent implements IEvent<{ structureId: Id; schoolId: Id }> {
  readonly type = 'fee.structure-created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { structureId: Id; schoolId: Id }) {}
}
