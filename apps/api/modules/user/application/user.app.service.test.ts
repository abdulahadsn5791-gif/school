import { describe, expect, test } from 'bun:test';
import {
  type ActorTier,
  type EmailVO,
  Id,
  type IEnrollmentRepository,
  type IImageStoragePort,
  type ImageSource,
  type IUserRepository,
  type UserAggregate,
} from '@ecomerece/domain';
import type { CreateUserType, UpdateUserType } from '@ecomerece/shared';
import { Actor } from '../../../core/actor/actor';
import { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import { UserAppService } from './user.app.service';

class MemoryUserRepository implements IUserRepository {
  readonly records: UserAggregate[] = [];

  async FindById(id: Id, tier: ActorTier = 'public'): Promise<UserAggregate | null> {
    const user = this.records.find((user) => user.id.equals(id)) ?? null;
    if (!user || tier === 'admin') return user;
    return isPubliclyVisible(user) ? user : null;
  }

  async FindByEmail(email: EmailVO, tier: ActorTier = 'public'): Promise<UserAggregate | null> {
    const user = this.records.find((user) => user.email.equals(email)) ?? null;
    if (!user || tier === 'admin') return user;
    return isPubliclyVisible(user) ? user : null;
  }

  async FindByIdOrThrow(id: Id, tier: ActorTier = 'public'): Promise<UserAggregate> {
    const user = await this.FindById(id, tier);
    if (!user) throw new Error('User not found');
    return user;
  }

  async FindByIds(ids: Id[], tier: ActorTier = 'public'): Promise<UserAggregate[]> {
    return this.records.filter(
      (user) =>
        ids.some((value) => user.id.equals(value)) && (tier === 'admin' || isPubliclyVisible(user)),
    );
  }

  async FindByEmailOrThrow(email: EmailVO): Promise<UserAggregate> {
    const user = await this.FindByEmail(email);
    if (!user) throw new Error('User not found');
    return user;
  }

  async Save(_user: UserAggregate): Promise<void> {}

  async Create(user: UserAggregate): Promise<void> {
    if (await this.FindByEmail(user.email)) throw new Error('User already exists');
    this.records.push(user);
  }

  async Delete(id: Id): Promise<void> {
    const index = this.records.findIndex((user) => user.id.equals(id));
    if (index >= 0) this.records.splice(index, 1);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await this.FindById(id));
  }

  async ExistsAnyByRole(role: 'admin' | 'student' | 'teacher'): Promise<boolean> {
    return this.records.some((user) => user.role.role.value === role);
  }

  async FindPaginated(_params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
    tier?: ActorTier;
  }) {
    return {
      data: [...this.records],
      meta: { nextCursor: null, prevCursor: null, hasMore: false },
    };
  }
} /** Mirrors USER_PUBLIC_VISIBILITY semantics for in-memory records. */
function isPubliclyVisible(user: UserAggregate): boolean {
  return user.isUsable;
}

const createUserData: CreateUserType = {
  name: { firstName: 'Test', lastName: 'Student' },
  email: 'student@example.com',
  password: 'Password1',
  role: 'student',
  avatar: 'https://example.com/avatar.png',
};

describe('UserAppService', () => {
  test('creates a user with a server-generated ID and requested administrator fields', async () => {
    const repository = new MemoryUserRepository();
    const service = new UserAppService(repository, new InMemoryEventBus());

    const created = await service.createUser(createUserData);

    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(created.fullName).toBe('Test Student');
    expect(created.email).toBe('student@example.com');
    expect(created.role).toBe('student');
    expect(created.avatar?.url).toBe('https://example.com/avatar.png');
    expect(repository.records[0]?.passwordHash.value).not.toBe(createUserData.password);
  });

  test('uploads data URI avatars through the configured image storage', async () => {
    const repository = new MemoryUserRepository();
    const uploadedSources: ImageSource[] = [];
    const cloudinaryUrl =
      'https://res.cloudinary.com/test-cloud/image/upload/v1/users/test/avatar.png';
    const imageStorage = {
      upload: async (source: ImageSource) => {
        uploadedSources.push(source);
        return {
          key: { value: 'users/test/avatar.png' },
          publicUrl: cloudinaryUrl,
          version: '1',
        };
      },
    } as unknown as IImageStoragePort;
    const service = new UserAppService(repository, new InMemoryEventBus(), undefined, imageStorage);
    const avatar = `data:image/png;base64,${Buffer.from('image').toString('base64')}`;

    const created = await service.createUser({ ...createUserData, avatar });

    expect(uploadedSources).toHaveLength(1);
    expect(uploadedSources[0]?.contentType).toBe('image/png');
    expect(uploadedSources[0]?.data).toBeInstanceOf(Uint8Array);
    expect(created.avatar?.url).toBe(cloudinaryUrl);
    expect(created.avatar?.publicId).toBe('users/test/avatar.png');
  });

  test('updates all administrator-managed fields', async () => {
    const repository = new MemoryUserRepository();
    const service = new UserAppService(repository, new InMemoryEventBus());
    const created = await service.createUser(createUserData);
    const data: UpdateUserType = {
      name: { firstName: 'Updated', lastName: 'Learner' },
      email: 'updated@example.com',
      password: 'Password2',
      avatar: null,
    };

    const updated = await service.updateUser(created.id, data);

    expect(updated.fullName).toBe('Updated Learner');
    expect(updated.email).toBe('updated@example.com');
    expect(updated.avatar?.url).toBeNull();
    expect(repository.records[0]?.passwordHash.value).not.toBe(data.password);
  });

  test('rejects duplicate email addresses', async () => {
    const repository = new MemoryUserRepository();
    const service = new UserAppService(repository, new InMemoryEventBus());
    await service.createUser(createUserData);

    await expect(service.createUser({ ...createUserData, role: 'teacher' })).rejects.toThrow(
      'An account with this email already exists.',
    );
  });

  test('requires class memberships to be removed before a role change', async () => {
    const repository = new MemoryUserRepository();
    const enrollmentRepository = {
      ExistsRoleEnrollment: async () => true,
    } as unknown as IEnrollmentRepository;
    const service = new UserAppService(repository, new InMemoryEventBus(), enrollmentRepository);
    const created = await service.createUser(createUserData);
    const actor = new Actor({
      id: Id.create(),
      role: 'admin',
      tier: 'admin',
      schoolId: null,
    });

    await expect(
      service.assignRole(
        { userId: created.id, role: 'teacher', reason: 'Promoted after review' },
        actor,
      ),
    ).rejects.toThrow('Remove the user from all classes before changing their role.');
  });
});
