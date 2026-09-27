import {
  EmailVO,
  Id,
  PasswordVO,
  UserAggregate,
  type UserRolesType,
  UserRoleVO,
} from '@ecomerece/domain';
import { AvatarVO } from '@ecomerece/domain/modules/user/value-objects/avatar.vo';
import { NameInfoVO } from '@ecomerece/domain/modules/user/value-objects/name-info.vo';
import { PersonName } from '@ecomerece/domain/value-objects/name.vo';

/**
 * Aggregate factories (ddd-testing-visual-notes.html: "The UserFactory
 * Pattern") — build aggregates directly in the state a test needs, without
 * fighting `create()`'s happy-path rules or sequential `rehydrate()` args.
 * Each factory takes the id explicitly so tests can reference fixtures.
 */

export const DEFAULT_YEAR = '2026-2027';

export const SCHOOL_ID = Id.create();
export const TEACHER_A_ID = Id.create();
export const TEACHER_B_ID = Id.create();
export const STUDENT_A_ID = Id.create();
export const STUDENT_B_ID = Id.create();

export const DUE_DATE = new Date(Date.now() + 7 * 86_400_000);

export function makeUser(overrides: {
  id?: Id;
  role?: UserRolesType;
  email?: string;
  fullName?: string;
}): UserAggregate {
  const names = (overrides.fullName ?? 'Test User').split(' ');
  return UserAggregate.create({
    id: overrides.id ?? Id.create(),
    name: NameInfoVO.create(
      PersonName.create(names[0]),
      names.length > 2 ? PersonName.create(names.slice(1, -1).join(' ')) : null,
      names.length > 1 ? PersonName.create(names[names.length - 1]) : null,
    ),
    email: EmailVO.create(overrides.email ?? 'user@test.school'),
    avatar: AvatarVO.none(),
    passwordHash: PasswordVO.create('$argon2id$v=19$m=65536,t=3,p=1$testsalt$fakehashvalue'),
    role: UserRoleVO.create(overrides.role ?? 'student'),
  });
}

export function makeTeacher(id?: Id, fullName = 'Test Teacher'): UserAggregate {
  return makeUser({ id: id ?? Id.create(), role: 'teacher', fullName });
}

export function makeStudent(id?: Id, fullName = 'Test Student'): UserAggregate {
  return makeUser({ id: id ?? Id.create(), role: 'student', fullName });
}

export function makeAdmin(id?: Id, fullName = 'Test Admin'): UserAggregate {
  return makeUser({ id: id ?? Id.create(), role: 'admin', fullName });
}
