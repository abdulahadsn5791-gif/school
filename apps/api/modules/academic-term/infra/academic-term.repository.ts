import type { AcademicTermAggregate, IAcademicTermRepository, Id } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { AcademicTermMapper } from './academic-term.mapper';
import { AcademicTermModel, type AcademicTermPersistence } from './academic-term.models';

export class AcademicTermRepository
  extends MongoRepository<AcademicTermPersistence>
  implements IAcademicTermRepository
{
  constructor() {
    super(AcademicTermModel);
  }

  async FindById(id: Id): Promise<AcademicTermAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return AcademicTermMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<AcademicTermAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Academic term not found.');
    return AcademicTermMapper.persistenceToAggregate(doc);
  }

  async FindBySchoolAndYear(schoolId: Id, academicYear: string): Promise<AcademicTermAggregate[]> {
    const docs = await super.find({ schoolId: schoolId.value, academicYear });
    return docs.map((doc) => AcademicTermMapper.persistenceToAggregate(doc));
  }

  async FindCurrentBySchoolAndYear(
    schoolId: Id,
    academicYear: string,
  ): Promise<AcademicTermAggregate | null> {
    const doc = await super.findOne({
      schoolId: schoolId.value,
      academicYear,
      isCurrent: true,
    });
    if (!doc) return null;
    return AcademicTermMapper.persistenceToAggregate(doc);
  }

  async Save(term: AcademicTermAggregate): Promise<void> {
    const { _id, ...data } = AcademicTermMapper.aggregateToPersistence(term);
    await AcademicTermModel.updateOne({ _id }, { $set: data });
  }

  async Create(term: AcademicTermAggregate): Promise<void> {
    const doc = new AcademicTermModel(AcademicTermMapper.aggregateToPersistence(term));
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
    data: AcademicTermAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<AcademicTermPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        AcademicTermMapper.persistenceToAggregate(doc as AcademicTermPersistence),
      ),
      meta: result.meta,
    };
  }
}
