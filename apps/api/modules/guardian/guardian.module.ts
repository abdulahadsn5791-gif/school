import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { GuardianAppService } from './application/guardian.app.service';
import { GuardianRepository } from './infra/guardian.repository';
import { GuardianController } from './presentation/guardian.controller';

/** Composition root (new.md §4): own repo + kernel buses; school via QueryBus. */
export function createGuardianModule() {
  const guardianRepo = new GuardianRepository();
  const appSvc = new GuardianAppService(guardianRepo, eventBus, queryBus);
  const guardianController = new GuardianController(appSvc);

  return {
    guardianController,
    appSvc,
  };
}
