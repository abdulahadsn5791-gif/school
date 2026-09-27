import { describe, expect, test } from 'bun:test';
import { Id, LeaveAggregate } from '@ecomerece/domain';
import { Actor } from '../../../core/actor/actor';
import { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import { MemoryLeaveRepository } from '../../../testing/memory-repositories';
import { LeaveAppService } from './leave.app.service';

const SCHOOL_ID = Id.create();
const TEACHER_A = Id.create();
const TEACHER_B = Id.create();

const FROM = new Date(Date.now() + 86_400_000);
const TO = new Date(Date.now() + 3 * 86_400_000);

function setup() {
  const leaveRepo = new MemoryLeaveRepository();
  /** QueryBus double: every referenced entity is live (tests own the rules). */
  const queryBus = {
    register: () => {},
    execute: async () => ({ id: 'x', schoolId: SCHOOL_ID.value, isDeleted: false }),
  } as never;
  const service = new LeaveAppService(leaveRepo, new InMemoryEventBus(), queryBus);
  return { service, leaveRepo };
}

function leaveFor(applicantId: Id) {
  return LeaveAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    applicantId,
    applicantRole: 'teacher',
    classId: null,
    fromDate: FROM,
    toDate: TO,
    reason: 'Family wedding out of town',
  });
}

/** Test actor builder — mirrors what auth/admin middleware produces. */
const asActor = (id: Id, role: 'teacher' | 'admin'): Actor =>
  new Actor({ id, role, tier: role === 'admin' ? 'admin' : 'public', schoolId: null });

const teacherA = asActor(TEACHER_A, 'teacher');
const admin = asActor(Id.create(), 'admin');

describe('LeaveAppService authorization', () => {
  test('a teacher cannot read another applicant’s leave by id', async () => {
    const { service, leaveRepo } = setup();
    const foreign = leaveFor(TEACHER_B);
    leaveRepo.records.push(foreign);

    await expect(service.getLeave(foreign.id.value, teacherA)).rejects.toThrow(
      /only view your own leave applications/i,
    );
  });

  test('a teacher can read their own leave by id', async () => {
    const { service, leaveRepo } = setup();
    const own = leaveFor(TEACHER_A);
    leaveRepo.records.push(own);

    const found = await service.getLeave(own.id.value, teacherA);

    expect(found.id).toBe(own.id.value);
  });

  test('an admin can read any leave', async () => {
    const { service, leaveRepo } = setup();
    const foreign = leaveFor(TEACHER_B);
    leaveRepo.records.push(foreign);

    const found = await service.getLeave(foreign.id.value, admin);

    expect(found.id).toBe(foreign.id.value);
  });

  test('a teacher’s list is forced to their own applications', async () => {
    const { service, leaveRepo } = setup();

    await service.listLeaves({ applicantId: TEACHER_B.value }, teacherA);

    expect(leaveRepo.lastFilter?.applicantId).toBe(TEACHER_A.value);
  });

  test('an admin list can filter by applicant', async () => {
    const { service, leaveRepo } = setup();

    await service.listLeaves({ applicantId: TEACHER_B.value }, admin);

    expect(leaveRepo.lastFilter?.applicantId).toBe(TEACHER_B.value);
  });

  test('a teacher cannot file a leave as a student', async () => {
    const { service } = setup();

    await expect(
      service.submit(
        {
          schoolId: SCHOOL_ID.value,
          applicantRole: 'student',
          fromDate: FROM,
          toDate: TO,
          reason: 'Trying to dodge the role check',
        },
        teacherA,
      ),
    ).rejects.toThrow(/only submit a leave for your own role/i);
  });

  test('a submitted leave is recorded against the authenticated applicant', async () => {
    const { service, leaveRepo } = setup();

    const created = await service.submit(
      {
        schoolId: SCHOOL_ID.value,
        applicantRole: 'teacher',
        fromDate: FROM,
        toDate: TO,
        reason: 'Family wedding out of town',
      },
      teacherA,
    );

    expect(created.applicantId).toBe(TEACHER_A.value);
    expect(created.status).toBe('PENDING');
    expect(leaveRepo.records).toHaveLength(1);
  });

  test('a leave reason under ten characters is rejected by the aggregate', () => {
    expect(() => leaveRepoCreateWithShortReason()).toThrow();
  });
});

function leaveRepoCreateWithShortReason() {
  return LeaveAggregate.create({
    id: Id.create(),
    schoolId: SCHOOL_ID,
    applicantId: TEACHER_A,
    applicantRole: 'teacher',
    classId: null,
    fromDate: FROM,
    toDate: TO,
    reason: 'too short',
  });
}
