import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { PeriodRepository } from '../period/infra/period.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { SubjectRepository } from '../subject/infra/subject.repository';
import { UserRepository } from '../user/infra/user.repository';
import { TimetableAppService } from './application/timetable.app.service';
import { TimetableRepository } from './infra/timetable.repository';
import { TimetableController } from './presentation/timetable.controller';

export function createTimetableModule() {
  const timetableRepo = new TimetableRepository();
  const appSvc = new TimetableAppService(
    timetableRepo,
    eventBus,
    new SchoolRepository(),
    new ClassRepository(),
    new SubjectRepository(),
    new PeriodRepository(),
    new UserRepository(),
  );
  const timetableController = new TimetableController(appSvc);

  return {
    timetableController,
    appSvc,
  };
}
