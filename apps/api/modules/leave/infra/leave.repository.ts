import type { Id, ILeaveRepository, LeaveAggregate, LeaveStatus } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { LeaveMapper } from './leave.mapper';
import { LeaveApplicationModel, type LeaveApplicationPersistence } from './leave.models';

export class LeaveRepository
  extends MongoRepository<LeaveApplicationPersistence>
  implements ILeaveRepository
{
  constructor() {
    super(LeaveApplicationModel);
  }

  async FindById(id: Id): Promise<LeaveAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return LeaveMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<LeaveAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Leave application not found.');
    return LeaveMapper.persistenceToAggregate(doc);
  }

  async FindByApplicant(
    schoolId: Id,
    applicantId: Id,
    status?: LeaveStatus,
  ): Promise<LeaveAggregate[]> {
    const filter: FilterQuery<LeaveApplicationPersistence> = {
      schoolId: schoolId.value,
      applicantId: applicantId.value,
    };
    if (status) filter.status = status;
    const docs = await super.find(filter);
    return docs.map((doc) => LeaveMapper.persistenceToAggregate(doc));
  }

  async FindBySchool(schoolId: Id, status?: LeaveStatus): Promise<LeaveAggregate[]> {
    const filter: FilterQuery<LeaveApplicationPersistence> = { schoolId: schoolId.value };
    if (status) filter.status = status;
    const docs = await super.find(filter);
    return docs.map((doc) => LeaveMapper.persistenceToAggregate(doc));
  }

  async Save(leave: LeaveAggregate): Promise<void> {
    const { _id, ...data } = LeaveMapper.aggregateToPersistence(leave);
    await LeaveApplicationModel.updateOne({ _id }, { $set: data });
  }

  async Create(leave: LeaveAggregate): Promise<void> {
    const doc = new LeaveApplicationModel(LeaveMapper.aggregateToPersistence(leave));
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
    data: LeaveAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<LeaveApplicationPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        LeaveMapper.persistenceToAggregate(doc as LeaveApplicationPersistence),
      ),
      meta: result.meta,
    };
  }
}
