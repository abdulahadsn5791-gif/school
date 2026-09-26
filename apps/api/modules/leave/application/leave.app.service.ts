import {
  type IClassRepository,
  Id,
  type IEventBus,
  type ILeaveRepository,
  type ISchoolRepository,
  LeaveAggregate,
  type LeaveReadModel,
  Reason,
} from '@ecomerece/domain';
import type {
  DeleteLeaveType,
  GetLeavesType,
  ReviewLeaveType,
  SubmitLeaveType,
} from '@ecomerece/shared';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { LeaveMapper } from '../infra/leave.mapper';
import { LeaveMessages } from '../presentation/leave.messages';

export class LeaveAppService {
  constructor(
    private readonly leaveRepo: ILeaveRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
    private readonly classRepo?: IClassRepository,
  ) {}

  private async publishEvents(leave: LeaveAggregate): Promise<void> {
    const events = leave.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async submit(
    data: SubmitLeaveType,
    actor: { _id: string; role: string },
  ): Promise<LeaveReadModel> {
    // A teacher cannot file as a student (or vice versa) — the declared role
    // must match the authenticated account.
    if (actor.role !== 'admin' && data.applicantRole !== actor.role) {
      throw new ForbiddenError('You can only submit a leave for your own role.');
    }

    const schoolId = Id.create(data.schoolId);
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }
    if (data.applicantRole === 'student' && data.classId) {
      const classId = Id.create(data.classId);
      if (this.classRepo) {
        const clazz = await this.classRepo.FindByIdOrThrow(classId);
        if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
      }
    }

    const leave = LeaveAggregate.create({
      id: Id.create(),
      schoolId,
      applicantId: Id.create(actor._id),
      applicantRole: data.applicantRole,
      classId: data.classId ? Id.create(data.classId) : null,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
    });

    await this.leaveRepo.Create(leave);
    await this.publishEvents(leave);
    return LeaveMapper.aggregateToReadModel(leave);
  }

  async approve(data: ReviewLeaveType, actor: { _id: string }): Promise<LeaveReadModel> {
    const leave = await this.leaveRepo.FindByIdOrThrow(Id.create(data.leaveId));
    if (leave.isDeleted) throw new NotFoundError('Leave application not found.');

    leave.approve(Id.create(actor._id), data.remark ?? null);

    await this.leaveRepo.Save(leave);
    await this.publishEvents(leave);
    return LeaveMapper.aggregateToReadModel(leave);
  }

  async reject(data: ReviewLeaveType, actor: { _id: string }): Promise<LeaveReadModel> {
    const leave = await this.leaveRepo.FindByIdOrThrow(Id.create(data.leaveId));
    if (leave.isDeleted) throw new NotFoundError('Leave application not found.');

    leave.reject(Id.create(actor._id), data.remark ?? null);

    await this.leaveRepo.Save(leave);
    await this.publishEvents(leave);
    return LeaveMapper.aggregateToReadModel(leave);
  }

  async getLeave(leaveId: string, actor?: { _id: string; role: string }): Promise<LeaveReadModel> {
    const leave = await this.leaveRepo.FindByIdOrThrow(Id.create(leaveId));
    // Admins may read any application; anyone else only their own, matching the list scope.
    if (actor && actor.role !== 'admin' && !leave.applicantId.equals(Id.create(actor._id))) {
      throw new ForbiddenError('You can only view your own leave applications.');
    }
    return LeaveMapper.aggregateToReadModel(leave);
  }

  async listLeaves(
    query: GetLeavesType,
    actor: { _id: string; role: string },
  ): Promise<{
    data: LeaveReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    // Teachers only ever see their own applications, regardless of the query.
    if (actor.role === 'admin') {
      if (query.applicantId) filter.applicantId = query.applicantId;
    } else {
      filter.applicantId = actor._id;
    }
    if (query.status) filter.status = query.status;

    const result = await this.leaveRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((leave) => LeaveMapper.aggregateToReadModel(leave)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteLeaveType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const leaveId = Id.create(data.leaveId);
    const leave = await this.leaveRepo.FindByIdOrThrow(leaveId);
    leave.delete(actorId, Reason.create(data.reason));
    await this.leaveRepo.Save(leave);
    await this.publishEvents(leave);
    return LeaveMessages.delete(leaveId, actorId).message;
  }
}
