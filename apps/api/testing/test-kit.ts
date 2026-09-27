import {
  Id,
  type IEvent,
  type IEventBus,
  type IEventHandler,
  type IQueryBus,
} from '@ecomerece/domain';
import { Actor } from '../core/actor/actor';
import { InMemoryQueryBus } from '../core/infrastructure/buses/in-memory-query-bus';
import { AssignmentAppService } from '../modules/assignment/application/assignment.app.service';
import { AttendanceAppService } from '../modules/attendance/application/attendance.app.service';
import { ClassAppService } from '../modules/class/application/class.app.service';
import { GetClassesByIdsHandler } from '../modules/class/application/query-handlers/get-classes-by-ids.handler';
import { EnrollmentAppService } from '../modules/enrollment/application/enrollment.app.service';
import { GetClassRosterHandler } from '../modules/enrollment/application/query-handlers/get-class-roster.handler';
import { PeriodAppService } from '../modules/period/application/period.app.service';
import { GetPeriodsByIdsHandler } from '../modules/period/application/query-handlers/get-periods-by-ids.handler';
import {
  GetClassSummaryByIdHandler,
  GetPeriodSummaryByIdHandler,
  GetSchoolSummaryByIdHandler,
  GetSubjectSummaryByIdHandler,
} from '../modules/school/application/query-handlers/entity-summary.handlers';
import { GetSchoolByCodeHandler } from '../modules/school/application/query-handlers/get-school-by-code.handler';
import { SchoolAppService } from '../modules/school/application/school.app.service';
import { GetSubjectsByIdsHandler } from '../modules/subject/application/query-handlers/get-subjects-by-ids.handler';
import { SubjectAppService } from '../modules/subject/application/subject.app.service';
import { TimetableAppService } from '../modules/timetable/application/timetable.app.service';
import {
  GetUserSummariesByIdsHandler,
  GetUserSummaryByIdHandler,
} from '../modules/user/application/query-handlers/user-summary.handlers';
import { UserAppService } from '../modules/user/application/user.app.service';
import {
  MemoryAssignmentRepository,
  MemoryAttendanceRepository,
  MemoryClassRepository,
  MemoryEnrollmentRepository,
  MemoryLeaveRepository,
  MemoryPeriodRepository,
  MemorySchoolRepository,
  MemoryStudentTestRepository,
  MemorySubjectRepository,
  MemoryTimetableRepository,
  MemoryUserRepository,
} from './memory-repositories';

/**
 * Recording event bus (ddd-testing-visual-notes.html: "MockEventBus") —
 * captures everything published so tests can assert on domain events.
 */
export class RecordingEventBus implements IEventBus {
  published: IEvent<unknown>[] = [];

  register(_eventType: string, _handler: IEventHandler<unknown>): void {
    void 0;
  }

  async publish(events: IEvent<unknown> | IEvent<unknown>[]): Promise<void> {
    const list = Array.isArray(events) ? events : [events];
    this.published.push(...list);
  }

  clear(): void {
    this.published = [];
  }

  ofType<T extends IEvent<unknown>>(type: string): T[] {
    return this.published.filter((e) => e.type === type) as T[];
  }
}

/** Actor builder — mirrors what auth/admin middleware produces. */
export function asActor(id: Id | string, role: 'teacher' | 'admin' | 'student'): Actor {
  return new Actor({
    id: typeof id === 'string' ? Id.create(id) : id,
    role,
    tier: role === 'admin' ? 'admin' : 'public',
    schoolId: null,
  });
}

/**
 * The whole engine on fakes (ddd-testing-visual-notes.html: "Application
 * Layer Tests"). Every app service runs against in-memory repositories with
 * the REAL QueryBus wired to REAL handlers over the same fakes — so the full
 * create → cross-module-lookup → screen-query flow is exercised with zero DB.
 *
 * Fresh state per call: never share a TestApp across `test()` blocks.
 */
export function createTestApp() {
  // ── Fakes ────────────────────────────────────────────────────────────
  const schoolRepo = new MemorySchoolRepository();
  const userRepo = new MemoryUserRepository();
  const classRepo = new MemoryClassRepository();
  const subjectRepo = new MemorySubjectRepository();
  const periodRepo = new MemoryPeriodRepository();
  const timetableRepo = new MemoryTimetableRepository();
  const enrollmentRepo = new MemoryEnrollmentRepository();
  const attendanceRepo = new MemoryAttendanceRepository();
  const assignmentRepo = new MemoryAssignmentRepository();
  const studentTestRepo = new MemoryStudentTestRepository();
  const leaveRepo = new MemoryLeaveRepository();

  // ── Kernel buses ─────────────────────────────────────────────────────
  const eventBus = new RecordingEventBus();
  const queryBus = new InMemoryQueryBus() as unknown as IQueryBus;

  // ── App services (production classes, no overrides) ─────────────────
  const schoolSvc = new SchoolAppService(schoolRepo, eventBus);
  const classSvc = new ClassAppService(classRepo, eventBus, queryBus);
  const subjectSvc = new SubjectAppService(subjectRepo, eventBus, queryBus);
  const periodSvc = new PeriodAppService(periodRepo, eventBus, queryBus);
  const timetableSvc = new TimetableAppService(timetableRepo, eventBus, queryBus);
  const enrollmentSvc = new EnrollmentAppService(enrollmentRepo, classRepo, eventBus, queryBus);
  const attendanceSvc = new AttendanceAppService(attendanceRepo, eventBus, queryBus, classRepo);
  const assignmentSvc = new AssignmentAppService(assignmentRepo, eventBus, queryBus, classRepo);
  const userSvc = new UserAppService(userRepo, eventBus, enrollmentRepo);

  // ── QueryBus handlers (same registrations the modules perform) ──────
  queryBus.register(GetSchoolSummaryByIdQuery, new GetSchoolSummaryByIdHandler(schoolSvc));
  queryBus.register(GetSchoolByCodeQuery, new GetSchoolByCodeHandler(schoolSvc));
  // The school module is the composition point for the school-scoped reference
  // entities (mirrors createSchoolModule) — class/subject/period summaries.
  queryBus.register(GetClassSummaryByIdQuery, new GetClassSummaryByIdHandler(classSvc));
  queryBus.register(GetSubjectSummaryByIdQuery, new GetSubjectSummaryByIdHandler(subjectSvc));
  queryBus.register(GetPeriodSummaryByIdQuery, new GetPeriodSummaryByIdHandler(periodSvc));
  queryBus.register(GetClassesByIdsQuery, new GetClassesByIdsHandler(classSvc));
  queryBus.register(GetSubjectsByIdsQuery, new GetSubjectsByIdsHandler(subjectSvc));
  queryBus.register(GetPeriodsByIdsQuery, new GetPeriodsByIdsHandler(periodSvc));
  queryBus.register(GetClassRosterQuery, new GetClassRosterHandler(enrollmentSvc));
  queryBus.register(GetUserSummaryByIdQuery, new GetUserSummaryByIdHandler(userSvc));
  queryBus.register(GetUserSummariesByIdsQuery, new GetUserSummariesByIdsHandler(userSvc));

  return {
    repos: {
      schoolRepo,
      userRepo,
      classRepo,
      subjectRepo,
      periodRepo,
      timetableRepo,
      enrollmentRepo,
      attendanceRepo,
      assignmentRepo,
      studentTestRepo,
      leaveRepo,
    },
    eventBus,
    queryBus,
    services: {
      school: schoolSvc,
      class: classSvc,
      subject: subjectSvc,
      period: periodSvc,
      timetable: timetableSvc,
      enrollment: enrollmentSvc,
      attendance: attendanceSvc,
      assignment: assignmentSvc,
      user: userSvc,
    },
  };
}

export type TestApp = ReturnType<typeof createTestApp>;

// Imported query classes (kept at the bottom so the wiring above reads first).
import {
  GetClassesByIdsQuery,
  GetClassRosterQuery,
  GetClassSummaryByIdQuery,
  GetPeriodSummaryByIdQuery,
  GetPeriodsByIdsQuery,
  GetSchoolByCodeQuery,
  GetSchoolSummaryByIdQuery,
  GetSubjectSummaryByIdQuery,
  GetSubjectsByIdsQuery,
  GetUserSummariesByIdsQuery,
  GetUserSummaryByIdQuery,
} from '@ecomerece/domain';
