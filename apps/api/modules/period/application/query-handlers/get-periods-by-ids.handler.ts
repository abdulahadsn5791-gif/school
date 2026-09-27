import type { GetPeriodsByIdsQuery } from '@ecomerece/domain';
import type { PeriodAppService } from '../period.app.service';

/** Thin adapter over the period module's app service (new.md §4/§6). */
export class GetPeriodsByIdsHandler {
  constructor(private readonly periodAppService: PeriodAppService) {}

  async handle(query: GetPeriodsByIdsQuery) {
    return this.periodAppService.getPeriodsByIds(query.ids);
  }
}
