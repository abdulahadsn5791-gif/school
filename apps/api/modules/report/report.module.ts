import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { AcademicTermRepository } from '../academic-term/infra/academic-term.repository';
import { ReportAppService } from './application/report.app.service';
import { ReportRepository } from './infra/report.repository';
import { ReportController } from './presentation/report.controller';

/**
 * Composition root (new.md §4). School/class/student existence checks go
 * through the QueryBus; the academic-term repository stays because the report
 * references the term record itself.
 */
export function createReportModule() {
  const reportRepo = new ReportRepository();
  const appSvc = new ReportAppService(reportRepo, eventBus, queryBus, new AcademicTermRepository());
  const reportController = new ReportController(appSvc);

  return {
    reportController,
    appSvc,
  };
}
