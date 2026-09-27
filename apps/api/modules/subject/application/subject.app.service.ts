import {
  GetSchoolByCodeQuery,
  GetSchoolSummaryByIdQuery,
  Id,
  type IEventBus,
  type IQueryBus,
  type ISubjectRepository,
  Reason,
  SubjectAggregate,
  type SubjectReadModel,
} from '@ecomerece/domain';
import type {
  CreateSubjectType,
  DeleteSubjectType,
  GetSubjectsType,
  UpdateSubjectType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { SubjectMapper } from '../infra/subject.mapper';
import { SubjectMessages } from '../presentation/subject.messages';

export class SubjectAppService {
  constructor(
    private readonly subjectRepo: ISubjectRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(subject: SubjectAggregate): Promise<void> {
    const events = subject.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createSubject(data: CreateSubjectType, actor: Actor): Promise<SubjectReadModel> {
    actor.assertAdmin();

    // Engine resolves the human key first (new.md §5): code or id, exactly one.
    const schoolId = await this.resolveSchool(data);
    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value));
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');

    // One live subject per school+code (schema partial unique index).
    const existing = await this.subjectRepo.FindBySchoolAndCode(schoolId, data.code);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('A subject with this code already exists for this school.');
    }

    const subject = SubjectAggregate.create({
      id: Id.create(),
      schoolId,
      name: data.name,
      code: data.code,
    });

    await this.subjectRepo.Create(subject);
    await this.publishEvents(subject);
    return SubjectMapper.aggregateToReadModel(subject);
  }

  async updateSubject(data: UpdateSubjectType, actor: Actor): Promise<SubjectReadModel> {
    actor.assertAdmin();

    const subject = await this.subjectRepo.FindByIdOrThrow(Id.create(data.subjectId));
    if (subject.isDeleted) throw new NotFoundError('Subject not found.');

    subject.rename(data.name);

    await this.subjectRepo.Save(subject);
    await this.publishEvents(subject);
    return SubjectMapper.aggregateToReadModel(subject);
  }

  async getSubject(subjectId: string): Promise<SubjectReadModel> {
    const subject = await this.subjectRepo.FindByIdOrThrow(Id.create(subjectId));
    return SubjectMapper.aggregateToReadModel(subject);
  }

  /** Batch read for screen queries (new.md §6). Hidden subjects are skipped. */
  async getSubjectsByIds(subjectIds: string[]): Promise<SubjectReadModel[]> {
    if (subjectIds.length === 0) return [];
    const subjects = await this.subjectRepo.FindByIds(subjectIds.map((id) => Id.create(id)));
    return subjects.map((subject) => SubjectMapper.aggregateToReadModel(subject));
  }

  async listSubjects(query: GetSubjectsType): Promise<{
    data: SubjectReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
      ];
    }

    const result = await this.subjectRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((subject) => SubjectMapper.aggregateToReadModel(subject)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteSubjectType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const subjectId = Id.create(data.subjectId);
    const subject = await this.subjectRepo.FindByIdOrThrow(subjectId);
    subject.delete(actorId, Reason.create(data.reason));
    await this.subjectRepo.Save(subject);
    await this.publishEvents(subject);
    return SubjectMessages.delete(subjectId, actorId).message;
  }

  /**
   * Code-or-id school resolution (new.md §5), via the school module's QueryBus
   * query. Requires exactly one of schoolId / schoolCode.
   */
  private async resolveSchool(data: { schoolId?: string; schoolCode?: string }): Promise<Id> {
    if (data.schoolId && data.schoolCode) {
      throw new ConflictError('Send either schoolId or schoolCode, not both.');
    }
    if (data.schoolId) return Id.create(data.schoolId);
    if (data.schoolCode) {
      const school = await this.queryBus.execute(new GetSchoolByCodeQuery(data.schoolCode));
      if (!school) {
        throw new NotFoundError(`No school exists with code "${data.schoolCode}".`);
      }
      return Id.create(school.id);
    }
    throw new ConflictError('A schoolId or schoolCode is required.');
  }

  async recover(subjectId: string, actor: Actor): Promise<SubjectReadModel> {
    actor.assertAdmin();

    const subject = await this.subjectRepo.FindByIdOrThrow(Id.create(subjectId));
    subject.recover();
    await this.subjectRepo.Save(subject);
    await this.publishEvents(subject);
    return SubjectMapper.aggregateToReadModel(subject);
  }
}
