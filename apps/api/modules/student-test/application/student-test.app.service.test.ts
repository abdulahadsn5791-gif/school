import { describe, expect, test } from 'bun:test';
import { AssignmentAggregate, ClassAggregate, Id, StudentTestAggregate } from '@ecomerece/domain';
import { Actor } from '../../../core/actor/actor';
import { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import {
  MemoryAssignmentRepository,
  MemoryStudentTestRepository,
} from '../../../testing/memory-repositories';
import { StudentTestAppService } from './student-test.app.service';

const SCHOOL_ID = Id.create();
const TEACHER_A = Id.create();
const TEACHER_B = Id.create();
const STUDENT = Id.create();
const SUBJECT_ID = Id.create();

const DUE = new Date(Date.now() + 7 * 86_400_000);

function setup() {
  const studentTestRepo = new MemoryStudentTestRepository();
  const assignmentRepo = new MemoryAssignmentRepository();
  const classA = ClassAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    name: 'Class A',
    grade: 'Year 5',
    section: 'A',
    academicYear: '2026',
    classTeacherId: TEACHER_A,
  });
  const classB = ClassAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    name: 'Class B',
    grade: 'Year 6',
    section: 'B',
    academicYear: '2026',
    classTeacherId: TEACHER_B,
  });

  const assignmentOfA = AssignmentAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    title: 'Mine',
    description: null,
    type: 'homework',
    classId: classA.id,
    subjectId: SUBJECT_ID,
    teacherId: TEACHER_A,
    assignedDate: new Date(),
    dueDate: DUE,
    totalMarks: 50,
    attachments: [],
  });
  const assignmentOfB = AssignmentAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    title: 'Theirs',
    description: null,
    type: 'homework',
    classId: classB.id,
    subjectId: SUBJECT_ID,
    teacherId: TEACHER_B,
    assignedDate: new Date(),
    dueDate: DUE,
    totalMarks: 20,
    attachments: [],
  });
  assignmentRepo.records.push(assignmentOfA, assignmentOfB);

  /** QueryBus double: every referenced entity is live (tests own the rules). */
  const queryBus = {
    register: () => {},
    execute: async () => ({
      id: 'x',
      schoolId: SCHOOL_ID.value,
      isDeleted: false,
      fullName: 'x',
      role: 'student',
    }),
  } as never;
  const service = new StudentTestAppService(
    studentTestRepo,
    new InMemoryEventBus(),
    queryBus,
    assignmentRepo,
  );
  return { service, studentTestRepo, assignmentRepo, assignmentOfA, assignmentOfB };
}

function submissionFor(assignmentId: Id) {
  return StudentTestAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    assignmentId,
    studentId: STUDENT,
  });
}

/** Test actor builder — mirrors what auth/admin middleware produces. */
const asActor = (id: Id, role: 'teacher' | 'admin' | 'student'): Actor =>
  new Actor({ id, role, tier: role === 'admin' ? 'admin' : 'public', schoolId: null });

const teacherA = asActor(TEACHER_A, 'teacher');
const admin = asActor(Id.create(), 'admin');

describe('StudentTestAppService authorization', () => {
  test('a teacher cannot grade a submission for another teacher’s assignment', async () => {
    const { service, studentTestRepo, assignmentOfB } = setup();
    const submission = submissionFor(assignmentOfB.id);
    submission.submit('my work', []);
    studentTestRepo.records.push(submission);

    await expect(
      service.grade({ studentTestId: submission.id.value, marksObtained: 10 }, teacherA),
    ).rejects.toThrow(/only grade submissions for your own assignments/i);
  });

  test('a teacher can grade their own submission', async () => {
    const { service, studentTestRepo, assignmentOfA } = setup();
    const submission = submissionFor(assignmentOfA.id);
    submission.submit('my work', []);
    studentTestRepo.records.push(submission);

    const graded = await service.grade(
      { studentTestId: submission.id.value, marksObtained: 40, teacherFeedback: 'Well done' },
      teacherA,
    );

    expect(graded.status).toBe('GRADED');
    expect(graded.marksObtained).toBe(40);
  });

  test('marks cannot exceed the assignment total', async () => {
    const { service, studentTestRepo, assignmentOfA } = setup();
    const submission = submissionFor(assignmentOfA.id);
    submission.submit('my work', []);
    studentTestRepo.records.push(submission);

    // assignmentOfA is worth 50.
    await expect(
      service.grade({ studentTestId: submission.id.value, marksObtained: 51 }, teacherA),
    ).rejects.toThrow(/cannot exceed the assignment total of 50/i);
  });

  test('marks equal to the assignment total are allowed', async () => {
    const { service, studentTestRepo, assignmentOfA } = setup();
    const submission = submissionFor(assignmentOfA.id);
    submission.submit('my work', []);
    studentTestRepo.records.push(submission);

    const graded = await service.grade(
      { studentTestId: submission.id.value, marksObtained: 50 },
      teacherA,
    );

    expect(graded.marksObtained).toBe(50);
  });

  test('the ceiling also applies to admins', async () => {
    const { service, studentTestRepo, assignmentOfA } = setup();
    const submission = submissionFor(assignmentOfA.id);
    submission.submit('my work', []);
    studentTestRepo.records.push(submission);

    await expect(
      service.grade({ studentTestId: submission.id.value, marksObtained: 5000 }, admin),
    ).rejects.toThrow(/cannot exceed the assignment total/i);
  });

  test('a teacher’s submission list is scoped to the assignments they own', async () => {
    const { service, studentTestRepo } = setup();

    await service.listSubmissions({ schoolId: SCHOOL_ID.value }, teacherA);

    expect(studentTestRepo.lastFilter?.assignmentId).toEqual({
      $in: expect.any(Array) as unknown as string[],
    });
  });

  test('a teacher asking for a foreign assignmentId gets an empty result', async () => {
    const { service, assignmentOfB } = setup();

    const result = await service.listSubmissions(
      { schoolId: SCHOOL_ID.value, assignmentId: assignmentOfB.id.value },
      teacherA,
    );

    expect(result.data).toEqual([]);
  });

  test('a teacher with no assignments gets an empty result', async () => {
    const { service } = setup();
    const stranger = asActor(Id.create(), 'teacher');

    const result = await service.listSubmissions({ schoolId: SCHOOL_ID.value }, stranger);

    expect(result.data).toEqual([]);
  });

  test('a teacher with no school in the query gets an empty result', async () => {
    const { service } = setup();

    const result = await service.listSubmissions({}, teacherA);

    expect(result.data).toEqual([]);
  });

  test('an admin list is not restricted to one teacher’s assignments', async () => {
    const { service, studentTestRepo } = setup();

    await service.listSubmissions({ schoolId: SCHOOL_ID.value }, admin);

    expect(studentTestRepo.lastFilter).not.toHaveProperty('assignmentId');
  });

  test('a student cannot submit on behalf of someone else', async () => {
    const { service, studentTestRepo, assignmentOfA } = setup();
    const submission = submissionFor(assignmentOfA.id);
    studentTestRepo.records.push(submission);
    const otherStudent = asActor(Id.create(), 'student');

    await expect(
      service.submit(
        { studentTestId: submission.id.value, submissionText: 'not mine' },
        otherStudent,
      ),
    ).rejects.toThrow(/only submit your own work/i);
  });
});
