import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { AcademicTermRepository } from '../academic-term/infra/academic-term.repository';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { UserRepository } from '../user/infra/user.repository';
import { ReportAppService } from './application/report.app.service';
import { ReportRepository } from './infra/report.repository';
import { ReportController } from './presentation/report.controller';

export function createReportModule() {
  const reportRepo = new ReportRepository();
  const appSvc = new ReportAppService(
    reportRepo,
    eventBus,
    new SchoolRepository(),
    new ClassRepository(),
    new AcademicTermRepository(),
    new UserRepository(),
  );
  const reportController = new ReportController(appSvc);

  return {
    reportController,
    appSvc,
  };
}
