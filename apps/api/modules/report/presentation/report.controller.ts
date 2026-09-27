import {
  createReportDto,
  deleteReportDto,
  getReportsDto,
  idSchema,
  updateReportDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { ReportAppService } from '../application/report.app.service';

export class ReportController extends BaseController<ReportAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createReportDto);
    return this.created(c, await this.service.createReport(data, actor));
  };

  getReportById = async (c: Context) => {
    const reportId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getReport(reportId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getReportsDto);
    return this.ok(c, await this.service.listReports(query));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateReportDto);
    return this.ok(c, await this.service.updateReport(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteReportDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };
}
