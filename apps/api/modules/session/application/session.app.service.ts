import {
  Id,
  type IEventBus,
  type ISessionRepository,
  SessionAggregate,
  type SessionReadModel,
} from '@ecomerece/domain';
import type { GetSessionsType, IssueSessionType, SessionIdType } from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { SessionMapper } from '../infra/session.mapper';
import { SessionMessages } from '../presentation/session.messages';

export class SessionAppService {
  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  private async publishEvents(session: SessionAggregate): Promise<void> {
    const events = session.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async issueSession(data: IssueSessionType, actor: Actor): Promise<SessionReadModel> {
    actor.assertAdmin();

    const session = SessionAggregate.create({
      id: Id.create(),
      userId: Id.create(data.userId),
      tokenHash: data.tokenHash,
      userAgent: data.userAgent ?? null,
      ip: data.ip ?? null,
      expiresAt: data.expiresAt,
    });

    await this.sessionRepo.Create(session);
    await this.publishEvents(session);
    return SessionMapper.aggregateToReadModel(session);
  }

  async revokeSession(data: SessionIdType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const session = await this.sessionRepo.FindByIdOrThrow(Id.create(data.sessionId));
    session.revoke();
    await this.sessionRepo.Save(session);
    await this.publishEvents(session);
    return SessionMessages.revoke(session.id, actor.id).message;
  }

  async revokeAllSessions(userId: string, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const count = await this.sessionRepo.RevokeAllForUser(Id.create(userId));
    return SessionMessages.revokeAll(Id.create(userId), actor.id, count).message;
  }

  async listSessions(query: GetSessionsType): Promise<{ data: SessionReadModel[] }> {
    const sessions = await this.sessionRepo.FindByUserId(Id.create(query.userId));
    return { data: sessions.map((session) => SessionMapper.aggregateToReadModel(session)) };
  }
}
