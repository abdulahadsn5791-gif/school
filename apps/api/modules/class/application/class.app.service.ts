import {
  ClassAggregate,
  type ClassReadModel,
  type IClassRepository,
  Id,
  type IEventBus,
  type ISchoolRepository,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateClassType,
  DeleteClassType,
  GetClassesType,
  UpdateClassType,
} from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { ClassMapper } from '../infra/class.mapper';
import { ClassMessages } from '../presentation/class.messages';

export class ClassAppService {
  constructor(
    private readonly classRepo: IClassRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
  ) {}

  private async publishEvents(clazz: ClassAggregate): Promise<void> {
    const events = clazz.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createClass(data: CreateClassType, _actor: { _id: string }): Promise<ClassReadModel> {
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(Id.create(data.schoolId));
      if (school.isDeleted) {
        throw new ConflictError('This school has been deleted.');
      }
    }

    // One live class per school/grade/section/year (schema partial unique index).
    const duplicates = await this.classRepo.FindBySchoolAndYear(
      Id.create(data.schoolId),
      data.academicYear,
    );
    const duplicate = duplicates.find(
      (c) => !c.isDeleted && c.grade === data.grade && c.section === data.section,
    );
    if (duplicate) {
      throw new ConflictError('A class with this grade and section already exists for this year.');
    }

    const clazz = ClassAggregate.create({
      id: Id.create(),
      schoolId: Id.create(data.schoolId),
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

  async updateClass(data: UpdateClassType, _actor: { _id: string }): Promise<ClassReadModel> {
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

  async listClasses(query: GetClassesType): Promise<{
    data: ClassReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
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

  async softDelete(data: DeleteClassType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const classId = Id.create(data.classId);
    const clazz = await this.classRepo.FindByIdOrThrow(classId);
    clazz.delete(actorId, Reason.create(data.reason));
    await this.classRepo.Save(clazz);
    await this.publishEvents(clazz);
    return ClassMessages.delete(classId, actorId).message;
  }

  async recover(classId: string, _actor: { _id: string }): Promise<ClassReadModel> {
    const clazz = await this.classRepo.FindByIdOrThrow(Id.create(classId));
    clazz.recover();
    await this.classRepo.Save(clazz);
    await this.publishEvents(clazz);
    return ClassMapper.aggregateToReadModel(clazz);
  }
}
