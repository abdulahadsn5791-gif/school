import { getSessionsDto, issueSessionDto, sessionIdDto } from '@ecomerece/shared';
import type { Context } from 'hono';
import { requireActor } from '../../../core/actor/actor-context';
import { BaseController } from '../../../core/controller/base.controller';
import type { SessionAppService } from '../application/session.app.service';

export class SessionController extends BaseController<SessionAppService> {
  issue = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, issueSessionDto);
    return this.created(c, await this.service.issueSession(data, actor));
  };

  list = async (c: Context) => {
    const query = this.query(c, getSessionsDto);
    return this.ok(c, await this.service.listSessions(query));
  };

  revoke = async (c: Context) => {
    const actor = requireActor();
    const data = await this.body(c, sessionIdDto);
    const message = await this.service.revokeSession(data, actor);
    return this.ok(c, { message });
  };

  revokeAll = async (c: Context) => {
    const actor = requireActor();
    const query = this.query(c, getSessionsDto);
    const message = await this.service.revokeAllSessions(query.userId, actor);
    return this.ok(c, { message });
  };
}
