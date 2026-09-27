import {
  AttendanceAggregate,
  type AttendanceReadModel,
  type AttendanceRegisterScreenReadModel,
  type ClassAggregate,
  GetClassRosterQuery,
  GetSchoolSummaryByIdQuery,
  GetUserSummaryByIdQuery,
  type IAttendanceRepository,
  type IClassRepository,
  Id,
  type IEventBus,
  type IQueryBus,
  Reason,
} from '@ecomerece/domain';
import type {
  DeleteAttendanceType,
  GetAttendanceType,
  MarkAttendanceType,
  UpdateAttendanceType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { AttendanceMapper } from '../infra/attendance.mapper';
import { AttendanceMessages } from '../presentation/attendance.messages';

/** The kernel Actor supplies everything this module needs. */
type ActorLike = Actor;

export class AttendanceAppService {
  constructor(
    private readonly attendanceRepo: IAttendanceRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
    private readonly classRepo?: IClassRepository,
  ) {}

  private async publishEvents(attendances: AttendanceAggregate[]): Promise<void> {
    const events = attendances.flatMap((attendance) => attendance.pullEvents());
    if (events.length > 0) await this.eventBus.publish(events);
  }

  private isClassTeacher(clazz: ClassAggregate, userId: string): boolean {
    return clazz.classTeacherId?.equals(Id.create(userId)) === true;
  }

  /**
   * Mark attendance for a whole class on one day. Idempotent per student:
   * an existing live record for the same student/day/period is re-marked
   * instead of failing the unique index.
   *
   * Admins may mark any class. Teachers may only mark classes they are the
   * class teacher of.
   */
  async mark(data: MarkAttendanceType, actor: ActorLike): Promise<AttendanceReadModel[]> {
    const schoolId = Id.create(data.schoolId);
    const classId = Id.create(data.classId);
    const markedBy = actor.id;

    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value));
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    if (this.classRepo) {
      const clazz = await this.classRepo.FindByIdOrThrow(classId);
      if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
      if (actor.role !== 'admin' && !this.isClassTeacher(clazz, actor.id.value)) {
        throw new ForbiddenError('You can only mark attendance for your own classes.');
      }
    }

    const results: AttendanceAggregate[] = [];
    for (const entry of data.entries) {
      const studentId = Id.create(entry.studentId);
      const existing = await this.attendanceRepo.FindByStudentAndDate(
        studentId,
        data.date,
        data.periodId ? Id.create(data.periodId) : undefined,
      );

      if (existing && !existing.isDeleted) {
        existing.updateStatus(entry.status, entry.remark ?? null, markedBy);
        await this.attendanceRepo.Save(existing);
        results.push(existing);
        continue;
      }

      const student = await this.queryBus.execute(new GetUserSummaryByIdQuery(studentId.value));
      if (student.isDeleted) {
        throw new ConflictError('One of the students is not available.');
      }

      const attendance = AttendanceAggregate.create({
        id: Id.create(),
        schoolId,
        studentId,
        classId,
        subjectId: data.subjectId ? Id.create(data.subjectId) : null,
        periodId: data.periodId ? Id.create(data.periodId) : null,
        date: data.date,
        status: entry.status,
        remark: entry.remark ?? null,
        markedBy,
      });
      await this.attendanceRepo.Create(attendance);
      results.push(attendance);
    }

    await this.publishEvents(results);
    return results.map((attendance) => AttendanceMapper.aggregateToReadModel(attendance));
  }

  async update(data: UpdateAttendanceType, actor: ActorLike): Promise<AttendanceReadModel> {
    actor.assertAdmin();

    const attendance = await this.attendanceRepo.FindByIdOrThrow(Id.create(data.attendanceId));
    if (attendance.isDeleted) throw new NotFoundError('Attendance record not found.');

    attendance.updateStatus(data.status, data.remark ?? null, actor.id);
    await this.attendanceRepo.Save(attendance);
    await this.publishEvents([attendance]);
    return AttendanceMapper.aggregateToReadModel(attendance);
  }

  async getByStudent(
    studentId: string,
    fromDate: string,
    toDate: string,
  ): Promise<AttendanceReadModel[]> {
    const records = await this.attendanceRepo.FindByStudentAndDateRange(
      Id.create(studentId),
      new Date(fromDate),
      new Date(toDate),
    );
    return records.filter((r) => !r.isDeleted).map((r) => AttendanceMapper.aggregateToReadModel(r));
  }

  /**
   * Throws unless the actor may read attendance for this class. Admins pass; a
   * teacher must be the class teacher, so the read path matches the write path
   * enforced by `mark`.
   */
  private async assertCanReadClass(classId: string, actor: ActorLike) {
    if (actor.role === 'admin' || !this.classRepo) return;
    const clazz = await this.classRepo.FindByIdOrThrow(Id.create(classId));
    if (!this.isClassTeacher(clazz, actor.id.value)) {
      throw new ForbiddenError('You can only view attendance for your own classes.');
    }
  }

  async getByClassAndDate(
    classId: string,
    date: string,
    actor: ActorLike,
  ): Promise<AttendanceReadModel[]> {
    await this.assertCanReadClass(classId, actor);
    const records = await this.attendanceRepo.FindByClassAndDate(
      Id.create(classId),
      new Date(date),
    );
    return records.filter((r) => !r.isDeleted).map((r) => AttendanceMapper.aggregateToReadModel(r));
  }

  /**
   * The attendance register screen (new.md §6): the class's students with names
   * and roll numbers, each pre-filled with any record already held for the day.
   * The roster is resolved cross-module through the QueryBus (public tier, batched
   * name lookups) — same ownership law as `mark`: admins any class, teachers only
   * their own.
   */
  async getRegister(classId: string, date: string, actor: ActorLike) {
    await this.assertCanReadClass(classId, actor);

    const [records, roster] = await Promise.all([
      this.attendanceRepo.FindByClassAndDate(Id.create(classId), new Date(date)),
      this.queryBus.execute(new GetClassRosterQuery(classId)),
    ]);

    const recordByStudent = new Map(
      records
        .filter((r) => !r.isDeleted)
        .map((r) => [r.studentId.value, AttendanceMapper.aggregateToReadModel(r)]),
    );

    const rows = roster.map((student) => {
      const record = recordByStudent.get(student.studentId) ?? null;
      return {
        studentId: student.studentId,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        record: record ? { id: record.id, status: record.status, remark: record.remark } : null,
      };
    });

    return {
      classId,
      date: new Date(date),
      isAlreadyMarked: recordByStudent.size > 0,
      rows,
    } as AttendanceRegisterScreenReadModel;
  }

  async list(
    query: GetAttendanceType,
    actor: ActorLike,
  ): Promise<{
    data: AttendanceReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    if (query.classId) await this.assertCanReadClass(query.classId, actor);
    if (!query.classId || !query.fromDate) {
      return { data: [], meta: { nextCursor: null, prevCursor: null, hasMore: false } };
    }
    const records = await this.attendanceRepo.FindByClassAndDate(
      Id.create(query.classId),
      query.fromDate,
    );
    const filtered = records.filter(
      (r) => !r.isDeleted && (!query.status || r.status === query.status),
    );
    return {
      data: filtered.map((r) => AttendanceMapper.aggregateToReadModel(r)),
      meta: { nextCursor: null, prevCursor: null, hasMore: false },
    };
  }

  async softDelete(data: DeleteAttendanceType, actor: ActorLike): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const attendanceId = Id.create(data.attendanceId);
    const attendance = await this.attendanceRepo.FindByIdOrThrow(attendanceId);
    attendance.delete(actorId, Reason.create(data.reason));
    await this.attendanceRepo.Save(attendance);
    await this.publishEvents([attendance]);
    return AttendanceMessages.delete(attendanceId, actorId).message;
  }
}
