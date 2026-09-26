import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { EventAppService } from './application/event.app.service';
import { EventRepository } from './infra/event.repository';
import { EventController } from './presentation/event.controller';

export function createEventModule() {
  const eventRepo = new EventRepository();
  const schoolRepo = new SchoolRepository();
  const classRepo = new ClassRepository();
  const appSvc = new EventAppService(eventRepo, eventBus, schoolRepo, classRepo);
  const eventController = new EventController(appSvc);

  return {
    eventController,
    appSvc,
  };
}
