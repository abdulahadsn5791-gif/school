import {
  AcademicTermAggregate,
  type AcademicTermReadModel,
  type IAcademicTermRepository,
  Id,
  type IEventBus,
  type ISchoolRepository,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateAcademicTermType,
  DeleteAcademicTermType,
  GetAcademicTermsType,
  UpdateAcademicTermType,
} from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { AcademicTermMapper } from '../infra/academic-term.mapper';
import { AcademicTermMessages } from '../presentation/academic-term.messages';

export class AcademicTermAppService {
  constructor(
    private readonly termRepo: IAcademicTermRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
  ) {}

  private async publishEvents(term: AcademicTermAggregate): Promise<void> {
    const events = term.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createTerm(
    data: CreateAcademicTermType,
    _actor: { _id: string },
  ): Promise<AcademicTermReadModel> {
    const schoolId = Id.create(data.schoolId);
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }

    // One live term per school/year/name (schema partial unique index).
    const siblings = await this.termRepo.FindBySchoolAndYear(schoolId, data.academicYear);
    if (siblings.some((t) => !t.isDeleted && t.name.value === data.name)) {
      throw new ConflictError('A term with this name already exists for this academic year.');
    }

    const term = AcademicTermAggregate.create({
      id: Id.create(),
      schoolId,
      academicYear: data.academicYear,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      isCurrent: data.isCurrent ?? false,
    });
    if (term.isCurrent) {
      await this.unmarkCurrentPeers(schoolId, data.academicYear, term.id);
    }

    await this.termRepo.Create(term);
    await this.publishEvents(term);
    return AcademicTermMapper.aggregateToReadModel(term);
  }

  async updateTerm(
    data: UpdateAcademicTermType,
    _actor: { _id: string },
  ): Promise<AcademicTermReadModel> {
    const term = await this.termRepo.FindByIdOrThrow(Id.create(data.academicTermId));
    if (term.isDeleted) throw new NotFoundError('Academic term not found.');

    if (data.name !== undefined) {
      const siblings = await this.termRepo.FindBySchoolAndYear(term.schoolId, term.academicYear);
      if (
        siblings.some(
          (t) => !t.isDeleted && t.id.equals(term.id) === false && t.name.value === data.name,
        )
      ) {
        throw new ConflictError('A term with this name already exists for this academic year.');
      }
    }
    if (data.name !== undefined) term.rename(data.name);
    if (data.isCurrent !== undefined && data.isCurrent !== term.isCurrent) {
      term.markCurrent(data.isCurrent);
      if (data.isCurrent) {
        await this.unmarkCurrentPeers(term.schoolId, term.academicYear, term.id);
      }
    }

    await this.termRepo.Save(term);
    await this.publishEvents(term);
    return AcademicTermMapper.aggregateToReadModel(term);
  }

  async getTerm(academicTermId: string): Promise<AcademicTermReadModel> {
    const term = await this.termRepo.FindByIdOrThrow(Id.create(academicTermId));
    return AcademicTermMapper.aggregateToReadModel(term);
  }

  async listTerms(query: GetAcademicTermsType): Promise<{
    data: AcademicTermReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.academicYear) filter.academicYear = query.academicYear;

    const result = await this.termRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((term) => AcademicTermMapper.aggregateToReadModel(term)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteAcademicTermType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const termId = Id.create(data.academicTermId);
    const term = await this.termRepo.FindByIdOrThrow(termId);
    term.delete(actorId, Reason.create(data.reason));
    await this.termRepo.Save(term);
    await this.publishEvents(term);
    return AcademicTermMessages.delete(termId, actorId).message;
  }

  async recover(academicTermId: string, _actor: { _id: string }): Promise<AcademicTermReadModel> {
    const term = await this.termRepo.FindByIdOrThrow(Id.create(academicTermId));
    term.recover();
    await this.termRepo.Save(term);
    await this.publishEvents(term);
    return AcademicTermMapper.aggregateToReadModel(term);
  }

  /** Keep at most one isCurrent term per school+year (app-level invariant). */
  private async unmarkCurrentPeers(
    schoolId: Id,
    academicYear: string,
    exceptTermId: Id,
  ): Promise<void> {
    const siblings = await this.termRepo.FindBySchoolAndYear(schoolId, academicYear);
    for (const sibling of siblings) {
      if (sibling.id.equals(exceptTermId) || !sibling.isCurrent) continue;
      sibling.markCurrent(false);
      await this.termRepo.Save(sibling);
    }
  }
}
