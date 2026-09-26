import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SchoolAppService } from './application/school.app.service';
import { SchoolRepository } from './infra/school.repository';
import { SchoolController } from './presentation/school.controller';

export function createSchoolModule() {
  const schoolRepo = new SchoolRepository();
  const appSvc = new SchoolAppService(schoolRepo, eventBus);
  const schoolController = new SchoolController(appSvc);

  return {
    schoolController,
    appSvc,
  };
}
