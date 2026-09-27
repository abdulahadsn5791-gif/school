import {
  createTimetableEntryDto,
  deleteTimetableEntryDto,
  getTimetableEntriesDto,
  idSchema,
  timetableEntryIdDto,
  updateTimetableEntryDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { TimetableAppService } from '../application/timetable.app.service';

export class TimetableController extends BaseController<TimetableAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createTimetableEntryDto);
    return this.created(c, await this.service.createEntry(data, actor));
  };

  getEntryById = async (c: Context) => {
    const entryId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getEntry(entryId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getTimetableEntriesDto);
    return this.ok(c, await this.service.listEntries(query));
  };

  /** Composed screen (new.md §6): the signed-in teacher's week, ready to render. */
  teacherScreen = async (c: Context) => {
    const actor = requireActor();
    return this.ok(c, await this.service.getTeacherTimetableScreen(actor));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateTimetableEntryDto);
    return this.ok(c, await this.service.updateEntry(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteTimetableEntryDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, timetableEntryIdDto);
    return this.ok(c, await this.service.recover(data.timetableEntryId, actor));
  };
}
