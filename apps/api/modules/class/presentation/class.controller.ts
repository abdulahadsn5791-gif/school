import {
  classIdDto,
  createClassDto,
  deleteClassDto,
  getClassesDto,
  idSchema,
  updateClassDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { ClassAppService } from '../application/class.app.service';

export class ClassController extends BaseController<ClassAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createClassDto);
    return this.created(c, await this.service.createClass(data, actor));
  };

  getClassById = async (c: Context) => {
    const classId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getClass(classId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getClassesDto);
    return this.ok(c, await this.service.listClasses(query));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateClassDto);
    return this.ok(c, await this.service.updateClass(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteClassDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, classIdDto);
    return this.ok(c, await this.service.recover(data.classId, actor));
  };
}
