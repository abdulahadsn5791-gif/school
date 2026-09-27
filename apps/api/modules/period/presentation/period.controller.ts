import {
  createPeriodDto,
  deletePeriodDto,
  getPeriodsDto,
  idSchema,
  periodIdDto,
  updatePeriodDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { PeriodAppService } from '../application/period.app.service';

export class PeriodController extends BaseController<PeriodAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createPeriodDto);
    return this.created(c, await this.service.createPeriod(data, actor));
  };

  getPeriodById = async (c: Context) => {
    const periodId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getPeriod(periodId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getPeriodsDto);
    return this.ok(c, await this.service.listPeriods(query));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updatePeriodDto);
    return this.ok(c, await this.service.updatePeriod(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deletePeriodDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, periodIdDto);
    return this.ok(c, await this.service.recover(data.periodId, actor));
  };
}
