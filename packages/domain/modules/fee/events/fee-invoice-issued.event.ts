import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class FeeInvoiceIssuedEvent implements IEvent<{ invoiceId: Id; studentId: Id }> {
  readonly type = 'fee.invoice-issued';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { invoiceId: Id; studentId: Id }) {}
}
