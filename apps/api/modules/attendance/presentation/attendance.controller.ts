import {
  deleteAttendanceDto,
  getAttendanceDto,
  markAttendanceDto,
  updateAttendanceDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { AttendanceAppService } from '../application/attendance.app.service';

export class AttendanceController extends BaseController<AttendanceAppService> {
  mark = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, markAttendanceDto);
    return this.created(c, await this.service.mark(data, actor));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateAttendanceDto);
    return this.ok(c, await this.service.update(data, actor));
  };

  list = async (c: Context) => {
    const query = this.query(c, getAttendanceDto);
    return this.ok(c, await this.service.list(query, requireActor()));
  };

  /** Composed screen (new.md §6): roster + existing records for one class/day. */
  register = async (c: Context) => {
    const actor = requireActor();
    const query = this.query(c, getAttendanceDto);
    if (!query.classId || !query.fromDate) return this.ok(c, null);
    return this.ok(
      c,
      await this.service.getRegister(query.classId, query.fromDate.toISOString(), actor),
    );
  };

  getByClassAndDate = async (c: Context) => {
    const query = this.query(c, getAttendanceDto);
    if (!query.classId || !query.fromDate) return this.ok(c, []);
    return this.ok(
      c,
      await this.service.getByClassAndDate(
        query.classId,
        query.fromDate.toISOString(),
        requireActor(),
      ),
    );
  };

  getByStudent = async (c: Context) => {
    const query = this.query(c, getAttendanceDto);
    if (!query.studentId || !query.fromDate || !query.toDate) return this.ok(c, []);
    return this.ok(
      c,
      await this.service.getByStudent(
        query.studentId,
        query.fromDate.toISOString(),
        query.toDate.toISOString(),
      ),
    );
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteAttendanceDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };
}
