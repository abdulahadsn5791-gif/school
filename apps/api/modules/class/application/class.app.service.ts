import {
  ClassAggregate,
  type ClassReadModel,
  GetSchoolByCodeQuery,
  GetSchoolSummaryByIdQuery,
  type IClassRepository,
  Id,
  type IEventBus,
  type IQueryBus,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateClassType,
  DeleteClassType,
  GetClassesType,
  UpdateClassType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { ClassMapper } from '../infra/class.mapper';
import { ClassMessages } from '../presentation/class.messages';

export class ClassAppService {
  constructor(
    private readonly classRepo: IClassRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(clazz: ClassAggregate): Promise<void> {
    const events = clazz.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createClass(data: CreateClassType, actor: Actor): Promise<ClassReadModel> {
    actor.assertAdmin();

    // Engine resolves the human key first (new.md §5): a school code may be sent
    // instead of the id; exactly one of the two is required.
    const schoolId = await this.resolveSchool(data);

    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value));
    if (school.isDeleted) {
      throw new ConflictError('This school has been deleted.');
    }

    // One live class per school/grade/section/year (schema partial unique index).
    const duplicates = await this.classRepo.FindBySchoolAndYear(schoolId, data.academicYear);
    const duplicate = duplicates.find(
      (c) => !c.isDeleted && c.grade === data.grade && c.section === data.section,
    );
    if (duplicate) {
      throw new ConflictError('A class with this grade and section already exists for this year.');
    }

    const clazz = ClassAggregate.create({
      id: Id.create(),
      schoolId,
      name: data.name,
      grade: data.grade,
      section: data.section,
      academicYear: data.academicYear,
      classTeacherId: data.classTeacherId ? Id.create(data.classTeacherId) : null,
    });

    await this.classRepo.Create(clazz);
    await this.publishEvents(clazz);
    return ClassMapper.aggregateToReadModel(clazz);
  }

  /**
   * Code-or-id school resolution (new.md §5): the school module owns the human
   * key; the class module reaches it through the QueryBus. Requires exactly one
   * of schoolId / schoolCode.
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

  async updateClass(data: UpdateClassType, actor: Actor): Promise<ClassReadModel> {
    actor.assertAdmin();

    const clazz = await this.classRepo.FindByIdOrThrow(Id.create(data.classId));
    if (clazz.isDeleted) throw new NotFoundError('Class not found.');

    if (data.name !== undefined) clazz.rename(data.name);
    if (data.classTeacherId !== undefined) {
      clazz.assignClassTeacher(data.classTeacherId ? Id.create(data.classTeacherId) : null);
    }

    await this.classRepo.Save(clazz);
    await this.publishEvents(clazz);
    return ClassMapper.aggregateToReadModel(clazz);
  }

  async getClass(classId: string): Promise<ClassReadModel> {
    const clazz = await this.classRepo.FindByIdOrThrow(Id.create(classId));
    return ClassMapper.aggregateToReadModel(clazz);
  }

  /** Batch read for screen queries (new.md §6). Hidden classes are skipped. */
  async getClassesByIds(classIds: string[]): Promise<ClassReadModel[]> {
    if (classIds.length === 0) return [];
    const classes = await this.classRepo.FindByIds(classIds.map((id) => Id.create(id)));
    return classes.map((clazz) => ClassMapper.aggregateToReadModel(clazz));
  }

  async listClasses(query: GetClassesType): Promise<{
    data: ClassReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.classTeacherId) filter.classTeacherId = query.classTeacherId;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' };
    }

    const result = await this.classRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((clazz) => ClassMapper.aggregateToReadModel(clazz)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteClassType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const classId = Id.create(data.classId);
    const clazz = await this.classRepo.FindByIdOrThrow(classId);
    clazz.delete(actorId, Reason.create(data.reason));
    await this.classRepo.Save(clazz);
    await this.publishEvents(clazz);
    return ClassMessages.delete(classId, actorId).message;
  }

  async recover(classId: string, actor: Actor): Promise<ClassReadModel> {
    actor.assertAdmin();

    const clazz = await this.classRepo.FindByIdOrThrow(Id.create(classId));
    clazz.recover();
    await this.classRepo.Save(clazz);
    await this.publishEvents(clazz);
    return ClassMapper.aggregateToReadModel(clazz);
  }
}
