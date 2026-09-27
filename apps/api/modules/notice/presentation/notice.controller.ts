import {
  createNoticeDto,
  deleteNoticeDto,
  getNoticesDto,
  idSchema,
  noticeIdDto,
  updateNoticeDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { NoticeAppService } from '../application/notice.app.service';

export class NoticeController extends BaseController<NoticeAppService> {
  create = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, createNoticeDto);
    return this.created(c, await this.service.createNotice(data, actor));
  };

  getNoticeById = async (c: Context) => {
    const noticeId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getNotice(noticeId));
  };

  list = async (c: Context) => {
    const query = this.query(c, getNoticesDto);
    return this.ok(c, await this.service.listNotices(query));
  };

  update = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, updateNoticeDto);
    return this.ok(c, await this.service.updateNotice(data, actor));
  };

  softDelete = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, deleteNoticeDto);
    const message = await this.service.softDelete(data, actor);
    return this.ok(c, { message });
  };

  recover = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, noticeIdDto);
    return this.ok(c, await this.service.recover(data.noticeId, actor));
  };
}
