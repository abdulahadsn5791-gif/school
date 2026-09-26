import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SchoolRepository } from '../school/infra/school.repository';
import { PeriodAppService } from './application/period.app.service';
import { PeriodRepository } from './infra/period.repository';
import { PeriodController } from './presentation/period.controller';

export function createPeriodModule() {
  const periodRepo = new PeriodRepository();
  const schoolRepo = new SchoolRepository();
  const appSvc = new PeriodAppService(periodRepo, eventBus, schoolRepo);
  const periodController = new PeriodController(appSvc);

  return {
    periodController,
    appSvc,
  };
}
