import {
  GetClassSummaryByIdQuery,
  GetSchoolSummaryByIdQuery,
  Id,
  type IEventBus,
  type INoticeRepository,
  type IQueryBus,
  NoticeAggregate,
  type NoticeReadModel,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateNoticeType,
  DeleteNoticeType,
  GetNoticesType,
  UpdateNoticeType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { NoticeMapper } from '../infra/notice.mapper';
import { NoticeMessages } from '../presentation/notice.messages';

export class NoticeAppService {
  constructor(
    private readonly noticeRepo: INoticeRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(notice: NoticeAggregate): Promise<void> {
    const events = notice.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createNotice(data: CreateNoticeType, actor: Actor): Promise<NoticeReadModel> {
    actor.assertAdmin();

    const schoolId = Id.create(data.schoolId);
    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value));
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');

    const classId = data.classId ? Id.create(data.classId) : null;
    if (classId) {
      const clazz = await this.queryBus.execute(new GetClassSummaryByIdQuery(classId.value));
      if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    }

    const notice = NoticeAggregate.create({
      id: Id.create(),
      schoolId,
      title: data.title,
      body: data.body,
      audience: data.audience,
      classId,
      publishedBy: actor.id,
      publishAt: data.publishAt ?? new Date(),
      expiresAt: data.expiresAt ?? null,
      attachments: data.attachments ?? [],
    });

    await this.noticeRepo.Create(notice);
    await this.publishEvents(notice);
    return NoticeMapper.aggregateToReadModel(notice);
  }

  async updateNotice(data: UpdateNoticeType, actor: Actor): Promise<NoticeReadModel> {
    actor.assertAdmin();

    const notice = await this.noticeRepo.FindByIdOrThrow(Id.create(data.noticeId));
    if (notice.isDeleted) throw new NotFoundError('Notice not found.');

    notice.update(
      data.title,
      data.body,
      data.audience,
      data.classId === undefined ? undefined : data.classId ? Id.create(data.classId) : null,
      data.expiresAt ?? undefined,
      data.attachments,
    );

    await this.noticeRepo.Save(notice);
    await this.publishEvents(notice);
    return NoticeMapper.aggregateToReadModel(notice);
  }

  async getNotice(noticeId: string): Promise<NoticeReadModel> {
    const notice = await this.noticeRepo.FindByIdOrThrow(Id.create(noticeId));
    return NoticeMapper.aggregateToReadModel(notice);
  }

  async listNotices(query: GetNoticesType): Promise<{
    data: NoticeReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.audience) filter.audience = query.audience;
    if (query.classId) filter.classId = query.classId;

    const result = await this.noticeRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((notice) => NoticeMapper.aggregateToReadModel(notice)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteNoticeType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const noticeId = Id.create(data.noticeId);
    const notice = await this.noticeRepo.FindByIdOrThrow(noticeId);
    notice.delete(actorId, Reason.create(data.reason));
    await this.noticeRepo.Save(notice);
    await this.publishEvents(notice);
    return NoticeMessages.delete(noticeId, actorId).message;
  }

  async recover(noticeId: string, actor: Actor): Promise<NoticeReadModel> {
    actor.assertAdmin();

    const notice = await this.noticeRepo.FindByIdOrThrow(Id.create(noticeId));
    notice.recover();
    await this.noticeRepo.Save(notice);
    await this.publishEvents(notice);
    return NoticeMapper.aggregateToReadModel(notice);
  }
}
