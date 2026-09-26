import {
  AssignmentAggregate,
  type AssignmentReadModel,
  type IAssignmentRepository,
  type IClassRepository,
  Id,
  type IEventBus,
  type ISchoolRepository,
  type ISubjectRepository,
  type IUserRepository,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateAssignmentType,
  DeleteAssignmentType,
  GetAssignmentsType,
  UpdateAssignmentType,
} from '@ecomerece/shared';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../errors/app-error';
import { AssignmentMapper } from '../infra/assignment.mapper';
import { AssignmentMessages } from '../presentation/assignment.messages';

export class AssignmentAppService {
  constructor(
    private readonly assignmentRepo: IAssignmentRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
    private readonly classRepo?: IClassRepository,
    private readonly subjectRepo?: ISubjectRepository,
    private readonly userRepo?: IUserRepository,
  ) {}

  private async publishEvents(assignment: AssignmentAggregate): Promise<void> {
    const events = assignment.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  private async assertRefsExist(
    schoolId: Id,
    classId: Id,
    subjectId: Id,
    teacherId: Id,
  ): Promise<void> {
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }
    if (this.classRepo) {
      const clazz = await this.classRepo.FindByIdOrThrow(classId);
      if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    }
    if (this.subjectRepo) {
      const subject = await this.subjectRepo.FindByIdOrThrow(subjectId);
      if (subject.isDeleted) throw new ConflictError('This subject has been deleted.');
    }
    if (this.userRepo) {
      const teacher = await this.userRepo.FindByIdOrThrow(teacherId);
      if (teacher.deleted.isDeleted) throw new ConflictError('This teacher is not available.');
    }
  }

  async createAssignment(
    data: CreateAssignmentType,
    actor: { _id: string; role: string },
  ): Promise<AssignmentReadModel> {
    const schoolId = Id.create(data.schoolId);
    const classId = Id.create(data.classId);
    const subjectId = Id.create(data.subjectId);
    // Teachers may only create assignments attributed to themselves, so the
    // client-supplied teacherId is ignored for non-admins.
    if (actor.role === 'admin' && !data.teacherId) {
      throw new BadRequestError('teacherId is required when creating an assignment as an admin.');
    }
    const teacherId = actor.role === 'admin' ? Id.create(data.teacherId) : Id.create(actor._id);

    await this.assertRefsExist(schoolId, classId, subjectId, teacherId);

    if (actor.role !== 'admin' && this.classRepo) {
      const clazz = await this.classRepo.FindByIdOrThrow(classId);
      if (!clazz.classTeacherId?.equals(Id.create(actor._id))) {
        throw new ForbiddenError('You can only create assignments for your own classes.');
      }
    }

    const assignment = AssignmentAggregate.create({
      id: Id.create(),
      schoolId,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      classId,
      subjectId,
      teacherId,
      assignedDate: data.assignedDate ?? new Date(),
      dueDate: data.dueDate,
      totalMarks: data.totalMarks ?? 100,
      attachments: data.attachments ?? [],
    });

    await this.assignmentRepo.Create(assignment);
    await this.publishEvents(assignment);
    return AssignmentMapper.aggregateToReadModel(assignment);
  }

  async updateAssignment(
    data: UpdateAssignmentType,
    actor: { _id: string; role: string },
  ): Promise<AssignmentReadModel> {
    const assignment = await this.assignmentRepo.FindByIdOrThrow(Id.create(data.assignmentId));
    if (assignment.isDeleted) throw new NotFoundError('Assignment not found.');
    if (actor.role !== 'admin' && !assignment.teacherId.equals(Id.create(actor._id))) {
      throw new ForbiddenError('You can only edit your own assignments.');
    }

    assignment.update(
      data.title,
      data.description,
      data.dueDate,
      data.totalMarks,
      data.attachments,
    );

    await this.assignmentRepo.Save(assignment);
    await this.publishEvents(assignment);
    return AssignmentMapper.aggregateToReadModel(assignment);
  }

  async getAssignment(assignmentId: string): Promise<AssignmentReadModel> {
    const assignment = await this.assignmentRepo.FindByIdOrThrow(Id.create(assignmentId));
    return AssignmentMapper.aggregateToReadModel(assignment);
  }

  async listAssignments(
    query: GetAssignmentsType,
    actor?: { _id: string; role: string },
  ): Promise<{
    data: AssignmentReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.classId) filter.classId = query.classId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.type) filter.type = query.type;
    // A teacher only ever sees their own assignments, whatever teacherId they ask for.
    if (actor && actor.role !== 'admin') {
      filter.teacherId = actor._id;
    } else if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    const result = await this.assignmentRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((assignment) => AssignmentMapper.aggregateToReadModel(assignment)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteAssignmentType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const assignmentId = Id.create(data.assignmentId);
    const assignment = await this.assignmentRepo.FindByIdOrThrow(assignmentId);
    assignment.delete(actorId, Reason.create(data.reason));
    await this.assignmentRepo.Save(assignment);
    await this.publishEvents(assignment);
    return AssignmentMessages.delete(assignmentId, actorId).message;
  }

  async recover(assignmentId: string, _actor: { _id: string }): Promise<AssignmentReadModel> {
    const assignment = await this.assignmentRepo.FindByIdOrThrow(Id.create(assignmentId));
    assignment.recover();
    await this.assignmentRepo.Save(assignment);
    await this.publishEvents(assignment);
    return AssignmentMapper.aggregateToReadModel(assignment);
  }
}
