import { describe, expect, test } from 'bun:test';
import { AttendanceAggregate, ClassAggregate, Id } from '@ecomerece/domain';
import { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import {
  MemoryAttendanceRepository,
  MemoryClassRepository,
} from '../../../testing/memory-repositories';
import { AttendanceAppService } from './attendance.app.service';

const SCHOOL_ID = Id.create();
const TEACHER_A = Id.create();
const TEACHER_B = Id.create();
const STUDENT = Id.create();

const TODAY = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

function classOwnedBy(teacherId: Id, name: string): ClassAggregate {
  return ClassAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    name,
    grade: 'Year 5',
    section: 'A',
    academicYear: '2026',
    classTeacherId: teacherId,
  });
}

function setup() {
  const attendanceRepo = new MemoryAttendanceRepository();
  const classRepo = new MemoryClassRepository();
  const classA = classOwnedBy(TEACHER_A, 'Class A');
  const classB = classOwnedBy(TEACHER_B, 'Class B');
  classRepo.records.push(classA, classB);
  const service = new AttendanceAppService(
    attendanceRepo,
    new InMemoryEventBus(),
    undefined,
    classRepo,
  );
  return { service, attendanceRepo, classA, classB };
}

const entry = (classId: Id) => ({
  schoolId: SCHOOL_ID.value,
  classId: classId.value,
  date: new Date(TODAY),
  entries: [{ studentId: STUDENT.value, status: 'PRESENT' as const, remark: null }],
});

describe('AttendanceAppService authorization', () => {
  test('a teacher cannot mark attendance for another teacher’s class', async () => {
    const { service, classB } = setup();

    await expect(
      service.mark(entry(classB.id), { _id: TEACHER_A.value, role: 'teacher' }),
    ).rejects.toThrow(/only mark attendance for your own classes/i);
  });

  test('a teacher can mark attendance for their own class', async () => {
    const { service, classA, attendanceRepo } = setup();

    const result = await service.mark(entry(classA.id), { _id: TEACHER_A.value, role: 'teacher' });

    expect(result).toHaveLength(1);
    expect(attendanceRepo.records).toHaveLength(1);
  });

  test('a teacher cannot read another teacher’s class register', async () => {
    const { service, classB } = setup();

    await expect(
      service.getByClassAndDate(classB.id.value, TODAY, { _id: TEACHER_A.value, role: 'teacher' }),
    ).rejects.toThrow(/only view attendance for your own classes/i);
  });

  test('a teacher can read their own class register', async () => {
    const { service, classA } = setup();

    const records = await service.getByClassAndDate(classA.id.value, TODAY, {
      _id: TEACHER_A.value,
      role: 'teacher',
    });

    expect(records).toEqual([]);
  });

  test('the list endpoint refuses another teacher’s class', async () => {
    const { service, classB } = setup();

    await expect(
      service.list(
        { classId: classB.id.value, fromDate: new Date(TODAY) },
        { _id: TEACHER_A.value, role: 'teacher' },
      ),
    ).rejects.toThrow(/only view attendance for your own classes/i);
  });

  test('an admin bypasses the ownership check', async () => {
    const { service, classB } = setup();

    const result = await service.mark(entry(classB.id), { _id: TEACHER_A.value, role: 'admin' });

    expect(result).toHaveLength(1);
  });

  test('re-marking the same student and day updates rather than duplicating', async () => {
    const { service, classA, attendanceRepo } = setup();
    const teacher = { _id: TEACHER_A.value, role: 'teacher' };

    await service.mark(entry(classA.id), teacher);
    await service.mark(
      {
        ...entry(classA.id),
        entries: [{ studentId: STUDENT.value, status: 'ABSENT' as const, remark: 'Called in' }],
      },
      teacher,
    );

    expect(attendanceRepo.records).toHaveLength(1);
    expect(attendanceRepo.records[0].status).toBe('ABSENT');
    expect(attendanceRepo.records[0].remark).toBe('Called in');
  });

  test('a record marked for a future date is rejected by the aggregate', () => {
    expect(() =>
      AttendanceAggregate.create({
        id: Id.create(),
        schoolId: SCHOOL_ID,
        studentId: STUDENT,
        classId: Id.create(),
        subjectId: null,
        periodId: null,
        date: new Date(Date.now() + 86_400_000),
        status: 'PRESENT',
        remark: null,
        markedBy: TEACHER_A,
      }),
    ).toThrow(/future date/i);
  });
});
