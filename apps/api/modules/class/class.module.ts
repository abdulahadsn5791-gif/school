import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SchoolRepository } from '../school/infra/school.repository';
import { ClassAppService } from './application/class.app.service';
import { ClassRepository } from './infra/class.repository';
import { ClassController } from './presentation/class.controller';

export function createClassModule() {
  const classRepo = new ClassRepository();
  const schoolRepo = new SchoolRepository();
  const appSvc = new ClassAppService(classRepo, eventBus, schoolRepo);
  const classController = new ClassController(appSvc);

  return {
    classController,
    appSvc,
  };
}
