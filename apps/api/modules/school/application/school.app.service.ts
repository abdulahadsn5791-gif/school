import {
  Id,
  type IEventBus,
  type ISchoolRepository,
  Reason,
  SchoolAggregate,
  type SchoolReadModel,
} from '@ecomerece/domain';
import type {
  CreateSchoolType,
  DeleteSchoolType,
  GetSchoolsType,
  UpdateSchoolType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { SchoolMapper } from '../infra/school.mapper';
import { SchoolMessages } from '../presentation/school.messages';

export class SchoolAppService {
  constructor(
    private readonly schoolRepo: ISchoolRepository,
    private readonly eventBus: IEventBus,
  ) {}

  private async publishEvents(school: SchoolAggregate): Promise<void> {
    const events = school.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createSchool(data: CreateSchoolType, actor: Actor): Promise<SchoolReadModel> {
    actor.assertAdmin();

    // One live school per code (schema partial unique index).
    const existing = await this.schoolRepo.FindByCode(data.code);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('A school with this code already exists.');
    }

    const school = SchoolAggregate.create({
      id: Id.create(), // server-side IDs only (engine law)
      name: data.name,
      code: data.code,
      address: data.address ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      logoUrl: data.logoUrl ?? null,
      timezone: data.timezone ?? 'Asia/Karachi',
    });

    await this.schoolRepo.Create(school);
    await this.publishEvents(school);
    return SchoolMapper.aggregateToReadModel(school);
  }

  async updateSchool(data: UpdateSchoolType, actor: Actor): Promise<SchoolReadModel> {
    actor.assertAdmin();

    const school = await this.schoolRepo.FindByIdOrThrow(Id.create(data.schoolId));
    if (school.isDeleted) throw new NotFoundError('School not found.');

    school.updateProfile(
      data.name,
      data.address,
      data.phone,
      data.email,
      data.logoUrl,
      data.timezone,
    );

    await this.schoolRepo.Save(school);
    await this.publishEvents(school);
    return SchoolMapper.aggregateToReadModel(school);
  }

  async getSchool(schoolId: string): Promise<SchoolReadModel> {
    const school = await this.schoolRepo.FindByIdOrThrow(Id.create(schoolId));
    return SchoolMapper.aggregateToReadModel(school);
  }

  /** Public lookup by human key (new.md §5). Hidden schools read as missing. */
  async getSchoolByCode(code: string): Promise<SchoolReadModel> {
    const school = await this.schoolRepo.FindByCode(code);
    if (!school || school.isDeleted) throw new NotFoundError('School not found.');
    return SchoolMapper.aggregateToReadModel(school);
  }

  /**
   * The school module's half of the ReferenceResolver law (new.md §5): resolve
   * a human key to the school Id, public tier. Lives here because the school
   * module owns its own key; sibling modules reach it via the QueryBus.
   */
  async resolveSchoolByCode(code: string): Promise<Id | null> {
    const school = await this.schoolRepo.FindByCode(code);
    if (!school || school.isDeleted) return null;
    return school.id;
  }

  async listSchools(query: GetSchoolsType): Promise<{
    data: SchoolReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
      ];
    }

    const result = await this.schoolRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((school) => SchoolMapper.aggregateToReadModel(school)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteSchoolType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const schoolId = Id.create(data.schoolId);
    const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
    school.delete(actorId, Reason.create(data.reason));
    await this.schoolRepo.Save(school);
    await this.publishEvents(school);
    return SchoolMessages.delete(schoolId, actorId).message;
  }

  async recover(schoolId: string, actor: Actor): Promise<SchoolReadModel> {
    actor.assertAdmin();

    const school = await this.schoolRepo.FindByIdOrThrow(Id.create(schoolId));
    school.recover();
    await this.schoolRepo.Save(school);
    await this.publishEvents(school);
    return SchoolMapper.aggregateToReadModel(school);
  }
}
