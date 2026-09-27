import {
  assignUserRoleDto,
  banUserDto,
  blockUserDto,
  createUserDto,
  deleteUserDto,
  extendBanDto,
  getAdminPaginatedUsersDto,
  idSchema,
  loginUserDto,
  objUserIdDto,
  updateUserDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { UserAppService } from '../application/user.app.service';

export class UserController extends BaseController<UserAppService> {
  create = async (c: Context) => {
    const data = await this.body(c, createUserDto);
    return this.created(c, await this.service.createUser(data));
  };

  login = async (c: Context) => {
    const data = await this.body(c, loginUserDto);
    return this.ok(c, await this.service.login(data));
  };

  getAdminPaginatedUsers = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedUsersDto);
    return this.ok(c, await this.service.findAdminPaginatedUsers(query));
  };

  getUserById = async (c: Context) => {
    const userId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getUserById(userId));
  };

  getMe = async (c: Context) => {
    const actor = requireActor();
    return this.ok(c, await this.service.getMe(actor));
  };

  update = async (c: Context) => {
    const userId = this.param(c, 'id', idSchema);
    const data = await this.body(c, updateUserDto);
    return this.ok(c, await this.service.updateUser(userId, data));
  };

  assignRole = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, assignUserRoleDto);
    return this.ok(c, await this.service.assignRole(data, actor));
  };

  blockUser = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, blockUserDto);
    return this.ok(c, await this.service.blockUser(data, actor));
  };

  blockLift = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, objUserIdDto);
    return this.ok(c, await this.service.blockLift(data.userId, actor));
  };

  banUser = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, banUserDto);
    return this.ok(c, await this.service.banUser(data, actor));
  };

  banLift = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, objUserIdDto);
    return this.ok(c, await this.service.banLift(data.userId, actor));
  };

  extendBan = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, extendBanDto);
    return this.ok(c, await this.service.extendBan(data, actor));
  };

  shortBan = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, extendBanDto);
    return this.ok(c, await this.service.shortenBan(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteUserDto);
    await this.service.softDeleteUser(data, actor);
    return this.noContent(c);
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, objUserIdDto);
    return this.ok(c, await this.service.recoverUser(data.userId, actor));
  };
}
