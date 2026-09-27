import {
  academicTermIdDto,
  createAcademicTermDto,
  deleteAcademicTermDto,
  getAcademicTermsDto,
  idSchema,
  updateAcademicTermDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { AcademicTermAppService } from '../application/academic-term.app.service';

export class AcademicTermController extends BaseController<AcademicTermAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createAcademicTermDto);
    return this.created(c, await this.service.createTerm(data, actor));
  };

  getTermById = async (c: Context) => {
    const termId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getTerm(termId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getAcademicTermsDto);
    return this.ok(c, await this.service.listTerms(query));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateAcademicTermDto);
    return this.ok(c, await this.service.updateTerm(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteAcademicTermDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, academicTermIdDto);
    return this.ok(c, await this.service.recover(data.academicTermId, actor));
  };
}
