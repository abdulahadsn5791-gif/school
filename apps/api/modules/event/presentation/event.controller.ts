import {
  createEventDto,
  deleteEventDto,
  eventIdDto,
  getEventsDto,
  idSchema,
  updateEventDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { EventAppService } from '../application/event.app.service';

export class EventController extends BaseController<EventAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createEventDto);
    return this.created(c, await this.service.createEvent(data, actor));
  };

  getEventById = async (c: Context) => {
    const eventId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getEvent(eventId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getEventsDto);
    return this.ok(c, await this.service.listEvents(query));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateEventDto);
    return this.ok(c, await this.service.updateEvent(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteEventDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, eventIdDto);
    return this.ok(c, await this.service.recover(data.eventId, actor));
  };
}
