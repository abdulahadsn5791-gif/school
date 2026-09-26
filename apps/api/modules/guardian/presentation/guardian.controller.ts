import {
  createGuardianDto,
  deleteGuardianDto,
  getGuardiansDto,
  guardianIdDto,
  idSchema,
  updateGuardianDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import type { GuardianAppService } from '../application/guardian.app.service';

export class GuardianController extends BaseController<GuardianAppService> {
  create = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, createGuardianDto);
    return this.created(c, await this.service.createGuardian(data, actor));
  };

  getGuardianById = async (c: Context) => {
    const guardianId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getGuardian(guardianId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getGuardiansDto);
    return this.ok(c, await this.service.listGuardians(query));
  };

  update = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, updateGuardianDto);
    return this.ok(c, await this.service.updateGuardian(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, deleteGuardianDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, guardianIdDto);
    return this.ok(c, await this.service.recover(data.guardianId, actor));
  };
}
