import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class FeePaymentRecordedEvent implements IEvent<{ invoiceId: Id; amount: number }> {
  readonly type = 'fee.payment-recorded';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { invoiceId: Id; amount: number }) {}
}
