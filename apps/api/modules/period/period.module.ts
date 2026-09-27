import { GetPeriodsByIdsQuery } from '@ecomerece/domain';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { PeriodAppService } from './application/period.app.service';
import { GetPeriodsByIdsHandler } from './application/query-handlers/get-periods-by-ids.handler';
import { PeriodRepository } from './infra/period.repository';
import { PeriodController } from './presentation/period.controller';

/** Composition root (new.md §4): own repo + kernel buses; school via QueryBus. */
export function createPeriodModule() {
  const periodRepo = new PeriodRepository();
  const appSvc = new PeriodAppService(periodRepo, eventBus, queryBus);
  const periodController = new PeriodController(appSvc);

  queryBus.register(GetPeriodsByIdsQuery, new GetPeriodsByIdsHandler(appSvc));

  return {
    periodController,
    appSvc,
  };
}
