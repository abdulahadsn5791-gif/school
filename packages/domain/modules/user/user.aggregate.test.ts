import { describe, expect, test } from 'bun:test';
import {
  AvatarVO,
  EmailVO,
  Id,
  NameInfoVO,
  PasswordVO,
  PersonName,
  UrlVO,
  UserAggregate,
  UserRoleVO,
} from '@ecomerece/domain';

const passwordHash =
  '$argon2id$v=19$m=65536,t=2,p=1$ddbcyBcbAcagei7wSkZFiouX6TqnUQHmTyS5mxGCzeM$+3OIaFatZ3n6LtMhUlfWbgJyNp7h8/oIsLK+LzZO+WI';
const updatedPasswordHash =
  '$argon2id$v=19$m=65536,t=2,p=1$ddbcyBcbAcagei7wSkZFiouX6TqnUQHmTyS5mxGCzeM$+3OIaFatZ3n6LtMhUlfWbgJyNp7h8/oIsLK+LzZO+WJ';

function createUser(role: 'admin' | 'student' | 'teacher'): UserAggregate {
  return UserAggregate.create({
    id: Id.create(),
    name: NameInfoVO.create(PersonName.create('Test'), null, PersonName.create('User')),
    email: EmailVO.create(`${role}@example.com`),
    avatar: AvatarVO.none(),
    passwordHash: PasswordVO.create(passwordHash),
    role: UserRoleVO.create(role),
  });
}

describe('UserAggregate', () => {
  test('allows administrators to provision every supported role', () => {
    const admin = createUser('admin');
    const teacher = createUser('teacher');
    const student = createUser('student');

    expect(admin.role.isAdmin).toBeTrue();
    expect(teacher.role.isTeacher).toBeTrue();
    expect(student.role.isStudent).toBeTrue();
  });

  test('updates all administrator-managed profile fields', () => {
    const user = createUser('student');
    user.pullEvents();

    user.updateProfile(
      NameInfoVO.create(PersonName.create('Updated'), null, PersonName.create('Name')),
      EmailVO.create('updated@example.com'),
    );
    user.updateAvatar(AvatarVO.fromUrl(UrlVO.create('https://example.com/avatar.png')));
    user.changePassword(PasswordVO.create(updatedPasswordHash));

    expect(user.name.fullName).toBe('Updated Name');
    expect(user.email.value).toBe('updated@example.com');
    expect(user.avatar.url?.value).toBe('https://example.com/avatar.png');
    expect(user.passwordHash.value).toBe(updatedPasswordHash);
  });
});
