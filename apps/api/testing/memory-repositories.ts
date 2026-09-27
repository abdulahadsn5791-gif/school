import type { EmailVO } from '@ecomerece/domain';
import {
  type AssignmentAggregate,
  type AttendanceAggregate,
  type ClassAggregate,
  type EnrollmentAggregate,
  type IAssignmentRepository,
  type IAttendanceRepository,
  type IClassRepository,
  Id,
  type IEnrollmentRepository,
  type ILeaveRepository,
  type IPeriodRepository,
  type ISchoolRepository,
  type IStudentTestRepository,
  type ISubjectRepository,
  type ITimetableRepository,
  type LeaveAggregate,
  type LeaveStatus,
  type PeriodAggregate,
  type SchoolAggregate,
  type StudentTestAggregate,
  type SubjectAggregate,
  type TimetableEntryAggregate,
  type UserAggregate,
} from '@ecomerece/domain';

type Page<T> = {
  data: T[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

const emptyPage = <T>(): Page<T> => ({
  data: [],
  meta: { nextCursor: null, prevCursor: null, hasMore: false },
});

const pageOf = <T>(data: T[]): Page<T> => ({
  data,
  meta: { nextCursor: null, prevCursor: null, hasMore: false },
});

const byId = <T extends { id: Id }>(records: T[], id: Id): T | undefined =>
  records.find((r) => r.id.equals(id));

/**
 * Minimal in-memory stand-ins for the repository ports.
 *
 * These exist so authorization can be exercised without Mongo. `FindPaginated`
 * does not implement a query engine; it records the filter it was handed so a
 * test can assert the scoping the service applied, which is the behaviour under
 * test.
 */
export class MemoryClassRepository implements IClassRepository {
  records: ClassAggregate[] = [];

  async FindById(id: Id): Promise<ClassAggregate | null> {
    return this.records.find((c) => c.id.equals(id)) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<ClassAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Class not found');
    return found;
  }

  async FindByIds(ids: Id[]): Promise<ClassAggregate[]> {
    return this.records.filter((c) => ids.some((id) => c.id.equals(id)));
  }

  async FindBySchool(schoolId: Id): Promise<ClassAggregate[]> {
    return this.records.filter((c) => c.schoolId.equals(schoolId));
  }

  async FindBySchoolAndYear(schoolId: Id, academicYear: string): Promise<ClassAggregate[]> {
    return this.records.filter(
      (c) => c.schoolId.equals(schoolId) && c.academicYear === academicYear,
    );
  }

  async FindByTeacher(teacherId: Id): Promise<ClassAggregate[]> {
    return this.records.filter((c) => c.classTeacherId?.equals(teacherId) === true);
  }

  async Save(clazz: ClassAggregate): Promise<void> {
    const index = this.records.findIndex((c) => c.id.equals(clazz.id));
    if (index >= 0) this.records[index] = clazz;
  }

  async Create(clazz: ClassAggregate): Promise<void> {
    this.records.push(clazz);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((c) => !c.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(): Promise<Page<ClassAggregate>> {
    return emptyPage<ClassAggregate>();
  }
}

export class MemoryAttendanceRepository implements IAttendanceRepository {
  records: AttendanceAggregate[] = [];

  async FindById(id: Id): Promise<AttendanceAggregate | null> {
    return this.records.find((a) => a.id.equals(id)) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<AttendanceAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Attendance not found');
    return found;
  }

  async FindByStudentAndDateRange(studentId: Id): Promise<AttendanceAggregate[]> {
    return this.records.filter((a) => a.studentId.equals(studentId));
  }

  async FindByClassAndDate(classId: Id): Promise<AttendanceAggregate[]> {
    return this.records.filter((a) => a.classId.equals(classId) && !a.isDeleted);
  }

  async FindByStudentAndDate(
    studentId: Id,
    _date: Date,
    periodId?: Id,
  ): Promise<AttendanceAggregate | null> {
    return (
      this.records.find(
        (a) =>
          a.studentId.equals(studentId) &&
          (periodId ? a.periodId?.equals(periodId) === true : a.periodId === null) &&
          !a.isDeleted,
      ) ?? null
    );
  }

  async Save(attendance: AttendanceAggregate): Promise<void> {
    const index = this.records.findIndex((a) => a.id.equals(attendance.id));
    if (index >= 0) this.records[index] = attendance;
  }

  async Create(attendance: AttendanceAggregate): Promise<void> {
    this.records.push(attendance);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((a) => !a.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }
}

export class MemoryAssignmentRepository implements IAssignmentRepository {
  records: AssignmentAggregate[] = [];
  lastFilter: Record<string, unknown> | undefined;

  async FindById(id: Id): Promise<AssignmentAggregate | null> {
    return this.records.find((a) => a.id.equals(id)) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<AssignmentAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Assignment not found');
    return found;
  }

  async FindByClass(schoolId: Id, classId: Id): Promise<AssignmentAggregate[]> {
    return this.records.filter(
      (a) => a.schoolId.equals(schoolId) && a.classId.equals(classId) && !a.isDeleted,
    );
  }

  async FindByTeacher(schoolId: Id, teacherId: Id): Promise<AssignmentAggregate[]> {
    return this.records.filter(
      (a) => a.schoolId.equals(schoolId) && a.teacherId.equals(teacherId) && !a.isDeleted,
    );
  }

  async FindByTeacherAllSchools(teacherId: Id, limit?: number): Promise<AssignmentAggregate[]> {
    const found = this.records.filter((a) => a.teacherId.equals(teacherId) && !a.isDeleted);
    return limit !== undefined ? found.slice(0, limit) : found;
  }

  async Save(assignment: AssignmentAggregate): Promise<void> {
    const index = this.records.findIndex((a) => a.id.equals(assignment.id));
    if (index >= 0) this.records[index] = assignment;
  }

  async Create(assignment: AssignmentAggregate): Promise<void> {
    this.records.push(assignment);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((a) => !a.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
  }): Promise<Page<AssignmentAggregate>> {
    this.lastFilter = params.filter;
    return emptyPage<AssignmentAggregate>();
  }
}

export class MemoryStudentTestRepository implements IStudentTestRepository {
  records: StudentTestAggregate[] = [];
  lastFilter: Record<string, unknown> | undefined;

  async FindById(id: Id): Promise<StudentTestAggregate | null> {
    return this.records.find((s) => s.id.equals(id)) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<StudentTestAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Submission not found');
    return found;
  }

  async FindByAssignmentAndStudent(
    assignmentId: Id,
    studentId: Id,
  ): Promise<StudentTestAggregate | null> {
    return (
      this.records.find(
        (s) => s.assignmentId.equals(assignmentId) && s.studentId.equals(studentId) && !s.isDeleted,
      ) ?? null
    );
  }

  async FindByAssignment(assignmentId: Id): Promise<StudentTestAggregate[]> {
    return this.records.filter((s) => s.assignmentId.equals(assignmentId) && !s.isDeleted);
  }

  async FindByStudent(studentId: Id): Promise<StudentTestAggregate[]> {
    return this.records.filter((s) => s.studentId.equals(studentId) && !s.isDeleted);
  }

  async Save(submission: StudentTestAggregate): Promise<void> {
    const index = this.records.findIndex((s) => s.id.equals(submission.id));
    if (index >= 0) this.records[index] = submission;
  }

  async Create(submission: StudentTestAggregate): Promise<void> {
    this.records.push(submission);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((s) => !s.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
  }): Promise<Page<StudentTestAggregate>> {
    this.lastFilter = params.filter;
    return emptyPage<StudentTestAggregate>();
  }
}

export class MemoryLeaveRepository implements ILeaveRepository {
  records: LeaveAggregate[] = [];
  lastFilter: Record<string, unknown> | undefined;

  async FindById(id: Id): Promise<LeaveAggregate | null> {
    return this.records.find((l) => l.id.equals(id)) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<LeaveAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Leave not found');
    return found;
  }

  async FindByApplicant(
    schoolId: Id,
    applicantId: Id,
    status?: LeaveStatus,
  ): Promise<LeaveAggregate[]> {
    return this.records.filter(
      (l) =>
        l.schoolId.equals(schoolId) &&
        l.applicantId.equals(applicantId) &&
        (!status || l.status === status) &&
        !l.isDeleted,
    );
  }

  async FindBySchool(schoolId: Id, status?: LeaveStatus): Promise<LeaveAggregate[]> {
    return this.records.filter(
      (l) => l.schoolId.equals(schoolId) && (!status || l.status === status) && !l.isDeleted,
    );
  }

  async Save(leave: LeaveAggregate): Promise<void> {
    const index = this.records.findIndex((l) => l.id.equals(leave.id));
    if (index >= 0) this.records[index] = leave;
  }

  async Create(leave: LeaveAggregate): Promise<void> {
    this.records.push(leave);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((l) => !l.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(params: { filter?: Record<string, unknown> }): Promise<Page<LeaveAggregate>> {
    this.lastFilter = params.filter;
    return emptyPage<LeaveAggregate>();
  }
}

export { Id };

/** Public-tier visibility check for in-memory user records (domain getter). */
function userVisible(user: UserAggregate): boolean {
  return user.isUsable;
}

export class MemorySchoolRepository implements ISchoolRepository {
  records: SchoolAggregate[] = [];

  async FindById(id: Id): Promise<SchoolAggregate | null> {
    return byId(this.records, id) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<SchoolAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('School not found');
    return found;
  }

  async FindByCode(code: string): Promise<SchoolAggregate | null> {
    const wanted = code.trim().toUpperCase();
    return this.records.find((s) => s.code === wanted) ?? null;
  }

  async Save(school: SchoolAggregate): Promise<void> {
    const index = this.records.findIndex((s) => s.id.equals(school.id));
    if (index >= 0) this.records[index] = school;
    else this.records.push(school);
  }

  async Create(school: SchoolAggregate): Promise<void> {
    this.records.push(school);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((s) => !s.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(): Promise<Page<SchoolAggregate>> {
    return pageOf(this.records.filter((s) => !s.isDeleted));
  }
}

/** Honors the domain public-visibility policy (deleted/banned/blocked hidden). */
export class MemoryUserRepository {
  records: UserAggregate[] = [];

  async FindById(id: Id, tier: 'public' | 'admin' = 'public'): Promise<UserAggregate | null> {
    const user = byId(this.records, id);
    if (!user) return null;
    return tier === 'admin' || userVisible(user) ? user : null;
  }

  async FindByEmail(
    email: EmailVO,
    tier: 'public' | 'admin' = 'public',
  ): Promise<UserAggregate | null> {
    const user = this.records.find((u) => u.email.equals(email));
    if (!user) return null;
    return tier === 'admin' || userVisible(user) ? user : null;
  }

  async FindByIdOrThrow(id: Id, tier: 'public' | 'admin' = 'public'): Promise<UserAggregate> {
    const user = await this.FindById(id, tier);
    if (!user) throw new Error('User not found');
    return user;
  }

  async FindByEmailOrThrow(
    email: EmailVO,
    tier: 'public' | 'admin' = 'public',
  ): Promise<UserAggregate> {
    const user = await this.FindByEmail(email, tier);
    if (!user) throw new Error('User not found');
    return user;
  }

  async FindByIds(ids: Id[], tier: 'public' | 'admin' = 'public'): Promise<UserAggregate[]> {
    const found: UserAggregate[] = [];
    for (const id of ids) {
      const user = await this.FindById(id, tier);
      if (user) found.push(user);
    }
    return found;
  }

  async Save(user: UserAggregate): Promise<void> {
    const index = this.records.findIndex((u) => u.id.equals(user.id));
    if (index >= 0) this.records[index] = user;
    else this.records.push(user);
  }

  async Create(user: UserAggregate): Promise<void> {
    this.records.push(user);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((u) => !u.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return this.records.some((u) => u.id.equals(id));
  }

  async ExistsAnyByRole(role: string): Promise<boolean> {
    return this.records.some((u) => u.role.role.value === role);
  }

  async FindPaginated(params: { tier?: 'public' | 'admin' }): Promise<Page<UserAggregate>> {
    const tier = params.tier ?? 'public';
    return pageOf(tier === 'admin' ? this.records : this.records.filter(userVisible));
  }
}

export class MemorySubjectRepository implements ISubjectRepository {
  records: SubjectAggregate[] = [];

  async FindById(id: Id): Promise<SubjectAggregate | null> {
    return byId(this.records, id) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<SubjectAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Subject not found');
    return found;
  }

  async FindByIds(ids: Id[]): Promise<SubjectAggregate[]> {
    return this.records.filter((s) => ids.some((id) => s.id.equals(id)));
  }

  async FindBySchoolAndCode(schoolId: Id, code: string): Promise<SubjectAggregate | null> {
    const wanted = code.trim().toUpperCase();
    return this.records.find((s) => s.schoolId.equals(schoolId) && s.code === wanted) ?? null;
  }

  async Save(subject: SubjectAggregate): Promise<void> {
    const index = this.records.findIndex((s) => s.id.equals(subject.id));
    if (index >= 0) this.records[index] = subject;
    else this.records.push(subject);
  }

  async Create(subject: SubjectAggregate): Promise<void> {
    this.records.push(subject);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((s) => !s.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(): Promise<Page<SubjectAggregate>> {
    return pageOf(this.records.filter((s) => !s.isDeleted));
  }
}

export class MemoryPeriodRepository implements IPeriodRepository {
  records: PeriodAggregate[] = [];

  async FindById(id: Id): Promise<PeriodAggregate | null> {
    return byId(this.records, id) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<PeriodAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Period not found');
    return found;
  }

  async FindByIds(ids: Id[]): Promise<PeriodAggregate[]> {
    return this.records.filter((p) => ids.some((id) => p.id.equals(id)));
  }

  async FindBySchool(schoolId: Id): Promise<PeriodAggregate[]> {
    return this.records.filter((p) => p.schoolId.equals(schoolId) && !p.isDeleted);
  }

  async FindBySchoolAndOrder(schoolId: Id, order: number): Promise<PeriodAggregate | null> {
    return this.records.find((p) => p.schoolId.equals(schoolId) && p.order === order) ?? null;
  }

  async Save(period: PeriodAggregate): Promise<void> {
    const index = this.records.findIndex((p) => p.id.equals(period.id));
    if (index >= 0) this.records[index] = period;
    else this.records.push(period);
  }

  async Create(period: PeriodAggregate): Promise<void> {
    this.records.push(period);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((p) => !p.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(): Promise<Page<PeriodAggregate>> {
    return pageOf(this.records.filter((p) => !p.isDeleted));
  }
}

export class MemoryTimetableRepository implements ITimetableRepository {
  records: TimetableEntryAggregate[] = [];

  async FindById(id: Id): Promise<TimetableEntryAggregate | null> {
    return byId(this.records, id) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<TimetableEntryAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Timetable entry not found');
    return found;
  }

  async FindByClass(
    schoolId: Id,
    classId: Id,
    academicYear: string,
  ): Promise<TimetableEntryAggregate[]> {
    return this.records.filter(
      (e) =>
        e.schoolId.equals(schoolId) &&
        e.classId.equals(classId) &&
        e.academicYear === academicYear &&
        !e.isDeleted,
    );
  }

  async FindByTeacher(
    schoolId: Id,
    teacherId: Id,
    academicYear: string,
  ): Promise<TimetableEntryAggregate[]> {
    return this.records.filter(
      (e) =>
        e.schoolId.equals(schoolId) &&
        e.teacherId.equals(teacherId) &&
        e.academicYear === academicYear &&
        !e.isDeleted,
    );
  }

  async FindByTeacherAllYears(teacherId: Id, limit?: number): Promise<TimetableEntryAggregate[]> {
    const found = this.records.filter((e) => e.teacherId.equals(teacherId) && !e.isDeleted);
    return limit !== undefined ? found.slice(0, limit) : found;
  }

  async FindSlotOccupant(params: {
    schoolId: Id;
    academicYear: string;
    dayOfWeek: TimetableEntryAggregate['dayOfWeek'];
    periodId: Id;
    classId?: Id;
    teacherId?: Id;
    exceptEntryId?: Id;
  }): Promise<TimetableEntryAggregate | null> {
    return (
      this.records.find(
        (e) =>
          !e.isDeleted &&
          e.schoolId.equals(params.schoolId) &&
          e.academicYear === params.academicYear &&
          e.dayOfWeek === params.dayOfWeek &&
          e.periodId.equals(params.periodId) &&
          (params.exceptEntryId ? !e.id.equals(params.exceptEntryId) : true) &&
          ((params.classId !== undefined && e.classId.equals(params.classId)) ||
            (params.teacherId !== undefined && e.teacherId.equals(params.teacherId))),
      ) ?? null
    );
  }

  async Save(entry: TimetableEntryAggregate): Promise<void> {
    const index = this.records.findIndex((e) => e.id.equals(entry.id));
    if (index >= 0) this.records[index] = entry;
    else this.records.push(entry);
  }

  async Create(entry: TimetableEntryAggregate): Promise<void> {
    this.records.push(entry);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((e) => !e.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
  }): Promise<Page<TimetableEntryAggregate>> {
    const filter = params.filter ?? {};
    const filtered = this.records.filter((entry) => {
      for (const [key, value] of Object.entries(filter)) {
        if (key === 'deleted.deleted') {
          if (entry.isDeleted) return false;
          continue;
        }
        const recordValue = (entry as unknown as Record<string, unknown>)[key];
        if (typeof value === 'string' && recordValue !== value) return false;
      }
      return true;
    });
    return pageOf(filtered);
  }
}

export class MemoryEnrollmentRepository implements IEnrollmentRepository {
  records: EnrollmentAggregate[] = [];

  async FindById(id: Id): Promise<EnrollmentAggregate | null> {
    return byId(this.records, id) ?? null;
  }

  async FindByIdOrThrow(id: Id): Promise<EnrollmentAggregate> {
    const found = await this.FindById(id);
    if (!found) throw new Error('Enrollment not found');
    return found;
  }

  async FindByStudentAndYear(
    studentId: Id,
    academicYear: string,
  ): Promise<EnrollmentAggregate | null> {
    return (
      this.records.find((e) => e.studentId.equals(studentId) && e.academicYear === academicYear) ??
      null
    );
  }

  async FindByClass(classId: Id): Promise<EnrollmentAggregate[]> {
    return this.records.filter((e) => e.classId.equals(classId));
  }

  async FindByClasses(classIds: Id[]): Promise<EnrollmentAggregate[]> {
    return this.records.filter((e) => classIds.some((id) => e.classId.equals(id)));
  }

  async FindByStudent(studentId: Id): Promise<EnrollmentAggregate[]> {
    return this.records.filter((e) => e.studentId.equals(studentId));
  }

  async FindActiveByStudent(studentId: Id): Promise<EnrollmentAggregate[]> {
    return this.records.filter((e) => e.studentId.equals(studentId) && !e.isDeleted);
  }

  async Save(enrollment: EnrollmentAggregate): Promise<void> {
    const index = this.records.findIndex((e) => e.id.equals(enrollment.id));
    if (index >= 0) this.records[index] = enrollment;
    else this.records.push(enrollment);
  }

  async Create(enrollment: EnrollmentAggregate): Promise<void> {
    this.records.push(enrollment);
  }

  async Delete(id: Id): Promise<void> {
    this.records = this.records.filter((e) => !e.id.equals(id));
  }

  async Exists(id: Id): Promise<boolean> {
    return (await this.FindById(id)) !== null;
  }

  async FindPaginated(): Promise<Page<EnrollmentAggregate>> {
    return pageOf(this.records.filter((e) => !e.isDeleted));
  }

  async ExistsRoleEnrollment(_userId: Id, _role: 'student' | 'teacher'): Promise<boolean> {
    return false;
  }
}
