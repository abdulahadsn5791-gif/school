import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ClassTeacherAssignedEvent implements IEvent<{ classId: Id; teacherId: Id }> {
  readonly type = 'class.teacher-assigned';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { classId: Id; teacherId: Id }) {}
}
