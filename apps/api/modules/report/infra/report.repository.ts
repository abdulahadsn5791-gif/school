import type { Id, IReportRepository, ReportAggregate } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { ReportMapper } from './report.mapper';
import { ReportModel, type ReportPersistence } from './report.models';

export class ReportRepository
  extends MongoRepository<ReportPersistence>
  implements IReportRepository
{
  constructor() {
    super(ReportModel);
  }

  async FindById(id: Id): Promise<ReportAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return ReportMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<ReportAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Report not found.');
    return ReportMapper.persistenceToAggregate(doc);
  }

  async FindByStudentAndTerm(studentId: Id, termId: Id): Promise<ReportAggregate | null> {
    const doc = await super.findOne({ studentId: studentId.value, termId: termId.value });
    if (!doc) return null;
    return ReportMapper.persistenceToAggregate(doc);
  }

  async FindByClassAndTerm(schoolId: Id, classId: Id, termId: Id): Promise<ReportAggregate[]> {
    const docs = await super.find({
      schoolId: schoolId.value,
      classId: classId.value,
      termId: termId.value,
    });
    return docs.map((doc) => ReportMapper.persistenceToAggregate(doc));
  }

  async Save(report: ReportAggregate): Promise<void> {
    const { _id, ...data } = ReportMapper.aggregateToPersistence(report);
    await ReportModel.updateOne({ _id }, { $set: data });
  }

  async Create(report: ReportAggregate): Promise<void> {
    const doc = new ReportModel(ReportMapper.aggregateToPersistence(report));
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
    data: ReportAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<ReportPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => ReportMapper.persistenceToAggregate(doc as ReportPersistence)),
      meta: result.meta,
    };
  }
}
