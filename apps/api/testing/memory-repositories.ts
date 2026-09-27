import {
  type AssignmentAggregate,
  type AttendanceAggregate,
  type ClassAggregate,
  type IAssignmentRepository,
  type IAttendanceRepository,
  type IClassRepository,
  Id,
  type ILeaveRepository,
  type IStudentTestRepository,
  type LeaveAggregate,
  type LeaveStatus,
  type StudentTestAggregate,
} from '@ecomerece/domain';

type Page<T> = {
  data: T[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

const emptyPage = <T>(): Page<T> => ({
  data: [],
  meta: { nextCursor: null, prevCursor: null, hasMore: false },
});

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
