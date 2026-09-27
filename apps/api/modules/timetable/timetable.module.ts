import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { TimetableAppService } from './application/timetable.app.service';
import { TimetableRepository } from './infra/timetable.repository';
import { TimetableController } from './presentation/timetable.controller';

/**
 * Composition root (new.md §4): own repo + kernel buses only. Cross-module
 * reads go through the QueryBus — no foreign repository imports.
 */
export function createTimetableModule() {
  const timetableRepo = new TimetableRepository();
  const appSvc = new TimetableAppService(timetableRepo, eventBus, queryBus);
  const timetableController = new TimetableController(appSvc);

  return {
    timetableController,
    appSvc,
  };
}
