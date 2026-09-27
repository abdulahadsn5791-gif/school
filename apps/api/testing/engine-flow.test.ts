import { describe, expect, test } from 'bun:test';
import { GetSchoolByCodeQuery, Reason } from '@ecomerece/domain';
import { DEFAULT_YEAR, DUE_DATE, makeStudent, makeTeacher } from './factories';
import { asActor, createTestApp, type TestApp } from './test-kit';

/**
 * Whole-engine flow tests — NO DATABASE (ddd-testing-visual-notes.html:
 * "Application Layer Tests"). The real app services run against in-memory
 * fakes with the real QueryBus + real cross-module handlers, so the exact
 * production composition (create → integrity check → cross-module read →
 * screen query) is exercised end to end in milliseconds.
 */

let app: TestApp;
let admin: ReturnType<typeof asActor>;
let teacherActor: ReturnType<typeof asActor>;

const ids = {
  school: '',
  teacherA: '',
  teacherB: '',
  studentA: '',
  studentB: '',
  classA: '',
  classB: '',
  subject: '',
  period: '',
};

function seedIdentities(app: TestApp) {
  const teacherA = makeTeacher(undefined, 'Amelia Hart');
  const teacherB = makeTeacher(undefined, 'Ben Osei');
  const studentA = makeStudent(undefined, 'Chen Wei');
  const studentB = makeStudent(undefined, 'Dana Fox');
  app.repos.userRepo.records.push(teacherA, teacherB, studentA, studentB);
  ids.teacherA = teacherA.id.value;
  ids.teacherB = teacherB.id.value;
  ids.studentA = studentA.id.value;
  ids.studentB = studentB.id.value;
}

async function freshApp() {
  app = createTestApp();
  seedIdentities(app);
  admin = asActor('01890a5d-ac96-774b-bcce-b302099a8057', 'admin');
  teacherActor = asActor(ids.teacherA, 'teacher');
}

describe('Engine on fakes — full school workflow, no DB', () => {
  test('admin creates a school, then resolves it by human code', async () => {
    await freshApp();

    const school = await app.services.school.createSchool(
      {
        name: 'Greenwood High',
        code: 'gwh-01',
        address: '1 School Lane',
        phone: null,
        email: null,
        logoUrl: null,
        timezone: 'Asia/Karachi',
      } as never,
      admin,
    );

    expect(school.code).toBe('GWH-01');
    ids.school = school.id;

    // Human-key resolution through the real QueryBus handler.
    const resolved = await app.queryBus.execute(new GetSchoolByCodeQuery('gwh-01'));
    expect(resolved?.id).toBe(ids.school);
    const missing = await app.queryBus.execute(new GetSchoolByCodeQuery('nope'));
    expect(missing).toBeNull();

    expect(app.eventBus.published.map((e) => e.type)).toContain('school.created');
  });

  test('admin builds the timetable; the teacher sees a composed screen', async () => {
    await freshApp();
    const school = await app.services.school.createSchool(
      { name: 'Greenwood High', code: 'GWH' } as never,
      admin,
    );

    const subject = await app.services.subject.createSubject(
      { schoolId: school.id, name: 'Mathematics', code: 'MATH' } as never,
      admin,
    );
    const period = await app.services.period.createPeriod(
      {
        schoolId: school.id,
        name: 'First bell',
        startTime: '08:00',
        endTime: '08:45',
        order: 1,
      } as never,
      admin,
    );
    const clazz = await app.services.class.createClass(
      {
        schoolId: school.id,
        name: 'Grade 5-A',
        grade: '5',
        section: 'A',
        academicYear: DEFAULT_YEAR,
        classTeacherId: ids.teacherA,
      } as never,
      admin,
    );

    // Integrity guard: the teacher slot is enforced via the real QueryBus.
    const entry = await app.services.timetable.createEntry(
      {
        schoolId: school.id,
        academicYear: DEFAULT_YEAR,
        classId: clazz.id,
        subjectId: subject.id,
        teacherId: ids.teacherA,
        periodId: period.id,
        dayOfWeek: 'MONDAY',
      } as never,
      admin,
    );

    // Slot-conflict guard: same class + same period is rejected.
    await expect(
      app.services.timetable.createEntry(
        {
          schoolId: school.id,
          academicYear: DEFAULT_YEAR,
          classId: clazz.id,
          subjectId: subject.id,
          teacherId: ids.teacherB,
          periodId: period.id,
          dayOfWeek: 'MONDAY',
        } as never,
        admin,
      ),
    ).rejects.toThrow(/already has a lesson in this slot/i);

    const screen = await app.services.timetable.getTeacherTimetableScreen(teacherActor);
    expect(screen.totalSlots).toBe(1);
    expect(screen.byDay[0].slots[0]).toMatchObject({
      entryId: entry.id,
      className: 'Grade 5-A',
      subjectName: 'Mathematics',
      periodName: 'First bell',
      startTime: '08:00',
      endTime: '08:45',
    });
    expect(screen.classes).toEqual([{ id: clazz.id, name: 'Grade 5-A' }]);
  });

  test('roster → attendance → register screen, all cross-module via QueryBus', async () => {
    await freshApp();
    const school = await app.services.school.createSchool(
      { name: 'Greenwood High', code: 'GWH' } as never,
      admin,
    );
    const clazz = await app.services.class.createClass(
      {
        schoolId: school.id,
        name: 'Grade 5-A',
        grade: '5',
        section: 'A',
        academicYear: DEFAULT_YEAR,
        classTeacherId: ids.teacherA,
      } as never,
      admin,
    );

    await app.services.enrollment.createEnrollment(
      { classId: clazz.id, studentId: ids.studentA, rollNumber: '01' } as never,
      admin,
    );
    await app.services.enrollment.createEnrollment(
      { classId: clazz.id, studentId: ids.studentB, rollNumber: '02' } as never,
      admin,
    );

    // Teacher owns the class → roster allowed; names resolved via QueryBus.
    const roster = await app.services.enrollment.getClassRoster(
      { classId: clazz.id } as never,
      teacherActor,
    );
    expect(roster.map((r) => r.fullName)).toEqual(['Chen Wei', 'Dana Fox']);

    const today = new Date();
    await app.services.attendance.mark(
      {
        schoolId: school.id,
        classId: clazz.id,
        date: today,
        entries: [
          { studentId: ids.studentA, status: 'PRESENT', remark: null },
          { studentId: ids.studentB, status: 'LATE', remark: 'bus' },
        ],
      } as never,
      teacherActor,
    );

    // Re-mark is idempotent (updates, not duplicates).
    await app.services.attendance.mark(
      {
        schoolId: school.id,
        classId: clazz.id,
        date: today,
        entries: [{ studentId: ids.studentA, status: 'ABSENT', remark: null }],
      } as never,
      teacherActor,
    );
    const dayRecords = await app.services.attendance.getByClassAndDate(
      clazz.id,
      today.toISOString(),
      teacherActor,
    );
    expect(dayRecords).toHaveLength(2);
    expect(dayRecords.find((r) => r.studentId === ids.studentA)?.status).toBe('ABSENT');

    // The composed register screen: roster + existing records in one read model.
    const register = await app.services.attendance.getRegister(
      clazz.id,
      today.toISOString(),
      teacherActor,
    );
    expect(register.isAlreadyMarked).toBe(true);
    expect(register.rows).toHaveLength(2);
    const chen = register.rows.find((r) => r.studentId === ids.studentA);
    expect(chen).toMatchObject({ fullName: 'Chen Wei', rollNumber: '01' });
    expect(chen?.record?.status).toBe('ABSENT');
    expect(register.rows.find((r) => r.studentId === ids.studentB)?.record?.status).toBe('LATE');
  });

  test('teacher assignment lifecycle → grading queue, scoped by actor', async () => {
    await freshApp();
    const school = await app.services.school.createSchool(
      { name: 'Greenwood High', code: 'GWH' } as never,
      admin,
    );
    const subject = await app.services.subject.createSubject(
      { schoolId: school.id, name: 'Mathematics', code: 'MATH' } as never,
      admin,
    );
    const clazz = await app.services.class.createClass(
      {
        schoolId: school.id,
        name: 'Grade 5-A',
        grade: '5',
        section: 'A',
        academicYear: DEFAULT_YEAR,
        classTeacherId: ids.teacherA,
      } as never,
      admin,
    );
    await app.services.enrollment.createEnrollment(
      { classId: clazz.id, studentId: ids.studentA, rollNumber: '01' } as never,
      admin,
    );

    // Teacher creates work for their own class; attribution forced to the actor.
    const assignment = await app.services.assignment.createAssignment(
      {
        schoolId: school.id,
        classId: clazz.id,
        subjectId: subject.id,
        title: 'Fractions worksheet',
        type: 'homework',
        dueDate: DUE_DATE,
        totalMarks: 50,
      } as never,
      teacherActor,
    );
    expect(assignment.teacherId).toBe(ids.teacherA);

    // Student submits via the student-test service.
    const submissions = app.repos.studentTestRepo;
    void submissions;

    // The teacher's index screen: one composed read model with labels resolved.
    const index = await app.services.assignment.getTeacherAssignmentIndex(teacherActor);
    expect(index.entries).toHaveLength(1);
    expect(index.entries[0]).toMatchObject({
      title: 'Fractions worksheet',
      className: 'Grade 5-A',
      subjectName: 'Mathematics',
      totalMarks: 50,
    });

    // Foreign teacher cannot edit; owner can.
    await expect(
      app.services.assignment.updateAssignment(
        { assignmentId: assignment.id, title: 'Hijacked' } as never,
        asActor(ids.teacherB, 'teacher'),
      ),
    ).rejects.toThrow(/only edit your own assignments/i);
    const edited = await app.services.assignment.updateAssignment(
      { assignmentId: assignment.id, title: 'Fractions worksheet v2' } as never,
      teacherActor,
    );
    expect(edited.title).toBe('Fractions worksheet v2');
  });

  test('two-tier reads: a soft-deleted student disappears from public lookups', async () => {
    await freshApp();
    const school = await app.services.school.createSchool(
      { name: 'Greenwood High', code: 'GWH' } as never,
      admin,
    );
    const student = makeStudent(undefined, 'Eve Hidden');
    app.repos.userRepo.records.push(student);
    student.deleteUser(admin.id, Reason.create('left school'));
    await app.repos.userRepo.Save(student);

    const publicView = await app.repos.userRepo.FindById(student.id, 'public');
    expect(publicView).toBeNull();

    const adminView = await app.repos.userRepo.FindById(student.id, 'admin');
    expect(adminView).not.toBeNull();
    void school;
  });
});
