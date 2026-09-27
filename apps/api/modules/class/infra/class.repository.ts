import type { ClassAggregate, IClassRepository, Id } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { ClassMapper } from './class.mapper';
import { ClassModel, type ClassPersistence } from './class.models';

export class ClassRepository extends MongoRepository<ClassPersistence> implements IClassRepository {
  constructor() {
    super(ClassModel);
  }

  async FindById(id: Id): Promise<ClassAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return ClassMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<ClassAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Class not found.');
    return ClassMapper.persistenceToAggregate(doc);
  }

  async FindByIds(ids: Id[]): Promise<ClassAggregate[]> {
    if (ids.length === 0) return [];
    const docs = await super.find({ _id: { $in: ids.map((id) => id.value) } });
    return docs.map((doc) => ClassMapper.persistenceToAggregate(doc));
  }

  async FindBySchool(schoolId: Id): Promise<ClassAggregate[]> {
    const docs = await super.find({ schoolId: schoolId.value });
    return docs.map((doc) => ClassMapper.persistenceToAggregate(doc));
  }

  async FindBySchoolAndYear(schoolId: Id, academicYear: string): Promise<ClassAggregate[]> {
    const docs = await super.find({ schoolId: schoolId.value, academicYear });
    return docs.map((doc) => ClassMapper.persistenceToAggregate(doc));
  }

  async FindByTeacher(teacherId: Id): Promise<ClassAggregate[]> {
    const docs = await super.find({ classTeacherId: teacherId.value });
    return docs.map((doc) => ClassMapper.persistenceToAggregate(doc));
  }

  async Save(clazz: ClassAggregate): Promise<void> {
    const { _id, ...data } = ClassMapper.aggregateToPersistence(clazz);
    await ClassModel.updateOne({ _id }, { $set: data });
  }

  async Create(clazz: ClassAggregate): Promise<void> {
    const doc = new ClassModel(ClassMapper.aggregateToPersistence(clazz));
    await doc.save({ session: this.session });
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ClassAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<ClassPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => ClassMapper.persistenceToAggregate(doc as ClassPersistence)),
      meta: result.meta,
    };
  }
}
