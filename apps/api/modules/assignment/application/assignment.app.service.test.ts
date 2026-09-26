import { describe, expect, test } from 'bun:test';
import { AssignmentAggregate, ClassAggregate, Id } from '@ecomerece/domain';
import { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import {
  MemoryAssignmentRepository,
  MemoryClassRepository,
} from '../../../testing/memory-repositories';
import { AssignmentAppService } from './assignment.app.service';

const SCHOOL_ID = Id.create();
const TEACHER_A = Id.create();
const TEACHER_B = Id.create();
const SUBJECT_ID = Id.create();

const DUE = new Date(Date.now() + 7 * 86_400_000);

function setup() {
  const assignmentRepo = new MemoryAssignmentRepository();
  const classRepo = new MemoryClassRepository();
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
  classRepo.records.push(classA, classB);
  const service = new AssignmentAppService(
    assignmentRepo,
    new InMemoryEventBus(),
    undefined,
    classRepo,
  );
  return { service, assignmentRepo, classA, classB };
}

function assignmentOwnedBy(teacherId: Id, classId: Id) {
  return AssignmentAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    title: 'Fractions worksheet',
    description: null,
    type: 'homework',
    classId,
    subjectId: SUBJECT_ID,
    teacherId,
    assignedDate: new Date(),
    dueDate: DUE,
    totalMarks: 100,
    attachments: [],
  });
}

const createBody = (classId: ClassAggregate, teacherId?: Id) => ({
  schoolId: SCHOOL_ID.value,
  title: 'Fractions worksheet',
  type: 'homework' as const,
  classId: classId.id.value,
  subjectId: SUBJECT_ID.value,
  ...(teacherId ? { teacherId: teacherId.value } : {}),
  dueDate: DUE,
  totalMarks: 100,
});

describe('AssignmentAppService authorization', () => {
  test('a teacher’s list is forced to their own work, ignoring the requested teacherId', async () => {
    const { service, assignmentRepo } = setup();

    await service.listAssignments(
      { teacherId: TEACHER_B.value },
      { _id: TEACHER_A.value, role: 'teacher' },
    );

    expect(assignmentRepo.lastFilter?.teacherId).toBe(TEACHER_A.value);
  });

  test('an admin list passes the requested teacherId through', async () => {
    const { service, assignmentRepo } = setup();

    await service.listAssignments({ teacherId: TEACHER_B.value }, { _id: 'x', role: 'admin' });

    expect(assignmentRepo.lastFilter?.teacherId).toBe(TEACHER_B.value);
  });

  test('an admin list with no teacherId is not filtered by teacher', async () => {
    const { service, assignmentRepo } = setup();

    await service.listAssignments({}, { _id: 'x', role: 'admin' });

    expect(assignmentRepo.lastFilter).not.toHaveProperty('teacherId');
  });

  test('a teacher cannot create an assignment for another teacher’s class', async () => {
    const { service, classB } = setup();

    await expect(
      service.createAssignment(createBody(classB), { _id: TEACHER_A.value, role: 'teacher' }),
    ).rejects.toThrow(/only create assignments for your own classes/i);
  });

  test('a teacher’s assignment is attributed to the actor, not the submitted teacherId', async () => {
    const { service, classA } = setup();

    const created = await service.createAssignment(createBody(classA, TEACHER_B), {
      _id: TEACHER_A.value,
      role: 'teacher',
    });

    expect(created.teacherId).toBe(TEACHER_A.value);
  });

  test('an admin must supply a teacherId', async () => {
    const { service, classA } = setup();

    await expect(
      service.createAssignment(createBody(classA), { _id: 'x', role: 'admin' }),
    ).rejects.toThrow(/teacherId is required/i);
  });

  test('an admin can attribute work to any teacher', async () => {
    const { service, classA } = setup();

    const created = await service.createAssignment(createBody(classA, TEACHER_B), {
      _id: 'x',
      role: 'admin',
    });

    expect(created.teacherId).toBe(TEACHER_B.value);
  });

  test('a teacher cannot edit another teacher’s assignment', async () => {
    const { service, assignmentRepo, classB } = setup();
    const foreign = assignmentOwnedBy(TEACHER_B, classB.id);
    assignmentRepo.records.push(foreign);

    await expect(
      service.updateAssignment(
        { assignmentId: foreign.id.value, title: 'Hijacked title' },
        { _id: TEACHER_A.value, role: 'teacher' },
      ),
    ).rejects.toThrow(/only edit your own assignments/i);
  });

  test('a teacher can edit their own assignment', async () => {
    const { service, assignmentRepo, classA } = setup();
    const own = assignmentOwnedBy(TEACHER_A, classA.id);
    assignmentRepo.records.push(own);

    const updated = await service.updateAssignment(
      { assignmentId: own.id.value, title: 'Revised worksheet' },
      { _id: TEACHER_A.value, role: 'teacher' },
    );

    expect(updated.title).toBe('Revised worksheet');
  });
});
