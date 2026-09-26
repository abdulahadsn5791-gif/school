import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SchoolRepository } from '../school/infra/school.repository';
import { SubjectAppService } from './application/subject.app.service';
import { SubjectRepository } from './infra/subject.repository';
import { SubjectController } from './presentation/subject.controller';

export function createSubjectModule() {
  const subjectRepo = new SubjectRepository();
  const schoolRepo = new SchoolRepository();
  const appSvc = new SubjectAppService(subjectRepo, eventBus, schoolRepo);
  const subjectController = new SubjectController(appSvc);

  return {
    subjectController,
    appSvc,
  };
}
