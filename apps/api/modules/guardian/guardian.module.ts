import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SchoolRepository } from '../school/infra/school.repository';
import { GuardianAppService } from './application/guardian.app.service';
import { GuardianRepository } from './infra/guardian.repository';
import { GuardianController } from './presentation/guardian.controller';

export function createGuardianModule() {
  const guardianRepo = new GuardianRepository();
  const schoolRepo = new SchoolRepository();
  const appSvc = new GuardianAppService(guardianRepo, eventBus, schoolRepo);
  const guardianController = new GuardianController(appSvc);

  return {
    guardianController,
    appSvc,
  };
}
