import {
  createTimetableEntryDto,
  deleteTimetableEntryDto,
  getTimetableEntriesDto,
  idSchema,
  timetableEntryIdDto,
  updateTimetableEntryDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { TimetableAppService } from '../application/timetable.app.service';

export class TimetableController extends BaseController<TimetableAppService> {
  create = async (c: Context) => {
    const actor = c.get('user');
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

  update = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateTimetableEntryDto);
    return this.ok(c, await this.service.updateEntry(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteTimetableEntryDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, timetableEntryIdDto);
    return this.ok(c, await this.service.recover(data.timetableEntryId, actor));
  };
}
