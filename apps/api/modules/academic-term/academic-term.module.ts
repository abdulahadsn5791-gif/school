import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { AcademicTermAppService } from './application/academic-term.app.service';
import { AcademicTermRepository } from './infra/academic-term.repository';
import { AcademicTermController } from './presentation/academic-term.controller';

/** Composition root (new.md §4): own repo + kernel buses; school via QueryBus. */
export function createAcademicTermModule() {
  const termRepo = new AcademicTermRepository();
  const appSvc = new AcademicTermAppService(termRepo, eventBus, queryBus);
  const academicTermController = new AcademicTermController(appSvc);

  return {
    academicTermController,
    appSvc,
  };
}
