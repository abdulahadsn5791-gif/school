import {
  createSubjectDto,
  deleteSubjectDto,
  getSubjectsDto,
  idSchema,
  subjectIdDto,
  updateSubjectDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { SubjectAppService } from '../application/subject.app.service';

export class SubjectController extends BaseController<SubjectAppService> {
  create = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createSubjectDto);
    return this.created(c, await this.service.createSubject(data, actor));
  };

  getSubjectById = async (c: Context) => {
    const subjectId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getSubject(subjectId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getSubjectsDto);
    return this.ok(c, await this.service.listSubjects(query));
  };

  update = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateSubjectDto);
    return this.ok(c, await this.service.updateSubject(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteSubjectDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, subjectIdDto);
    return this.ok(c, await this.service.recover(data.subjectId, actor));
  };
}
