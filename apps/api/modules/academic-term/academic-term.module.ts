import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SchoolRepository } from '../school/infra/school.repository';
import { AcademicTermAppService } from './application/academic-term.app.service';
import { AcademicTermRepository } from './infra/academic-term.repository';
import { AcademicTermController } from './presentation/academic-term.controller';

export function createAcademicTermModule() {
  const termRepo = new AcademicTermRepository();
  const schoolRepo = new SchoolRepository();
  const appSvc = new AcademicTermAppService(termRepo, eventBus, schoolRepo);
  const academicTermController = new AcademicTermController(appSvc);

  return {
    academicTermController,
    appSvc,
  };
}
