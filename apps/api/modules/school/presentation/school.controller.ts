import {
  createSchoolDto,
  deleteSchoolDto,
  getSchoolsDto,
  idSchema,
  schoolIdDto,
  updateSchoolDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { SchoolAppService } from '../application/school.app.service';

export class SchoolController extends BaseController<SchoolAppService> {
  create = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createSchoolDto);
    return this.created(c, await this.service.createSchool(data, actor));
  };

  getSchoolById = async (c: Context) => {
    const schoolId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getSchool(schoolId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getSchoolsDto);
    return this.ok(c, await this.service.listSchools(query));
  };

  update = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateSchoolDto);
    return this.ok(c, await this.service.updateSchool(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteSchoolDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, schoolIdDto);
    return this.ok(c, await this.service.recover(data.schoolId, actor));
  };
}
