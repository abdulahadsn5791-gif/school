import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassAppService } from './application/class.app.service';
import { ClassRepository } from './infra/class.repository';
import { ClassController } from './presentation/class.controller';

export function createClassModule() {
  const classRepo = new ClassRepository();
  const appSvc = new ClassAppService(classRepo, eventBus);
  const classController = new ClassController(appSvc);

  return {
    classController,
    appSvc,
  };
}
