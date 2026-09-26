import {
  deleteLeaveDto,
  getLeavesDto,
  idSchema,
  reviewLeaveDto,
  submitLeaveDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { LeaveAppService } from '../application/leave.app.service';

export class LeaveController extends BaseController<LeaveAppService> {
  submit = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, submitLeaveDto);
    return this.created(c, await this.service.submit(data, actor));
  };

  approve = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, reviewLeaveDto);
    return this.ok(c, await this.service.approve(data, actor));
  };

  reject = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, reviewLeaveDto);
    return this.ok(c, await this.service.reject(data, actor));
  };

  getLeaveById = async (c: Context) => {
    const leaveId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getLeave(leaveId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getLeavesDto);
    return this.ok(c, await this.service.listLeaves(query));
  };

  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteLeaveDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };
}
