import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { FeeAppService } from './application/fee.app.service';
import { FeeRepository } from './infra/fee.repository';
import { FeeController } from './presentation/fee.controller';

export function createFeeModule() {
  const feeRepo = new FeeRepository();
  const appSvc = new FeeAppService(feeRepo, eventBus);
  const feeController = new FeeController(appSvc);

  return {
    feeController,
    appSvc,
  };
}
