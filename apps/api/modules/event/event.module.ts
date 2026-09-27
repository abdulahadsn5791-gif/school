import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { EventAppService } from './application/event.app.service';
import { EventRepository } from './infra/event.repository';
import { EventController } from './presentation/event.controller';

/** Composition root (new.md §4): own repo + kernel buses; refs via QueryBus. */
export function createEventModule() {
  const eventRepo = new EventRepository();
  const appSvc = new EventAppService(eventRepo, eventBus, queryBus);
  const eventController = new EventController(appSvc);

  return {
    eventController,
    appSvc,
  };
}
