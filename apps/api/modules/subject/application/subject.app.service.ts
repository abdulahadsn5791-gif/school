import {
  Id,
  type IEventBus,
  type ISchoolRepository,
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
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { SubjectMapper } from '../infra/subject.mapper';
import { SubjectMessages } from '../presentation/subject.messages';

export class SubjectAppService {
  constructor(
    private readonly subjectRepo: ISubjectRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
  ) {}

  private async publishEvents(subject: SubjectAggregate): Promise<void> {
    const events = subject.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createSubject(data: CreateSubjectType, _actor: { _id: string }): Promise<SubjectReadModel> {
    const schoolId = Id.create(data.schoolId);
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }

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

  async updateSubject(data: UpdateSubjectType, _actor: { _id: string }): Promise<SubjectReadModel> {
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

  async softDelete(data: DeleteSubjectType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const subjectId = Id.create(data.subjectId);
    const subject = await this.subjectRepo.FindByIdOrThrow(subjectId);
    subject.delete(actorId, Reason.create(data.reason));
    await this.subjectRepo.Save(subject);
    await this.publishEvents(subject);
    return SubjectMessages.delete(subjectId, actorId).message;
  }

  async recover(subjectId: string, _actor: { _id: string }): Promise<SubjectReadModel> {
    const subject = await this.subjectRepo.FindByIdOrThrow(Id.create(subjectId));
    subject.recover();
    await this.subjectRepo.Save(subject);
    await this.publishEvents(subject);
    return SubjectMapper.aggregateToReadModel(subject);
  }
}
