import {
  AvatarVO,
  EffectiveDate,
  EmailVO,
  Id,
  type IEnrollmentRepository,
  type IEventBus,
  type IImageStoragePort,
  ImageSource,
  type IUserRepository,
  NameInfoVO,
  PersonName,
  Reason,
  UrlVO,
  UserAggregate,
  UserRoleVO,
} from '@ecomerece/domain';
import { PasswordVO } from '@ecomerece/domain/modules/user/value-objects/password.vo';
import type {
  AssignUserRoleType,
  BanUserType,
  BlockUserType,
  CreateUserType,
  DeleteUserType,
  ExtendBanType,
  GetAdminPaginatedUsersType,
  GetPaginatedUsersType,
  LoginUserType,
  UpdateUserType,
  UserResponseReadModel,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { BadRequestError, ConflictError } from '../../../errors/app-error';
import { hashPassword, verifyPassword } from '../../../lib/password';
import { createImageStorageModule } from '../../image-storage/image-storage.module';
import { UserMapper } from '../infra/user.mapper';
import { UserMessages, type UserMessagesType } from '../presentation/user.messages';
import { createUserToken } from './user.token';

export class UserAppService {
  private imageStorage: IImageStoragePort | null;

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly enrollmentRepo?: IEnrollmentRepository,
    imageStorage?: IImageStoragePort,
  ) {
    this.imageStorage = imageStorage ?? null;
  }

  private async publishEvents(user: UserAggregate): Promise<void> {
    const events = user.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  private async issueToken(user: UserAggregate): Promise<string> {
    return createUserToken(user.id.value, user.role.role.value);
  }

  private createName(name: CreateUserType['name']): NameInfoVO {
    return NameInfoVO.create(
      PersonName.create(name.firstName),
      name.middleName ? PersonName.create(name.middleName) : null,
      name.lastName ? PersonName.create(name.lastName) : null,
    );
  }

  private async resolveAvatar(value: string | null | undefined, userId: Id): Promise<AvatarVO> {
    if (value === null || value === undefined) return AvatarVO.none();
    if (!value.startsWith('data:')) return AvatarVO.fromUrl(UrlVO.create(value));

    const match = /^data:(image\/(?:png|jpe?g|gif|webp|avif));base64,([A-Za-z0-9+/=]+)$/.exec(
      value,
    );
    if (!match) throw new BadRequestError('Invalid avatar image data.');

    this.imageStorage ??= createImageStorageModule();
    const contentType = match[1];
    const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
    const stored = await this.imageStorage.upload(
      ImageSource.fromBytes(
        Uint8Array.from(Buffer.from(match[2], 'base64')),
        contentType,
        `avatar.${extension}`,
      ),
      {
        folder: ['users', userId.value],
        overwrite: true,
      },
    );
    return AvatarVO.create(UrlVO.create(stored.publicUrl), stored.key.value, EffectiveDate.today());
  }

  async createUser(data: CreateUserType): Promise<UserResponseReadModel> {
    const email = EmailVO.create(data.email);
    if (await this.userRepo.FindByEmail(email)) {
      throw new ConflictError('An account with this email already exists.');
    }

    const id = Id.create();
    const user = UserAggregate.create({
      id,
      name: this.createName(data.name),
      email,
      avatar: await this.resolveAvatar(data.avatar, id),
      passwordHash: PasswordVO.create(await hashPassword(data.password)),
      role: UserRoleVO.create(data.role),
    });
    await this.userRepo.Create(user);
    await this.publishEvents(user);
    return UserMapper.aggregateToResponseReadModel(user);
  }

  async updateUser(userIdValue: string, data: UpdateUserType): Promise<UserResponseReadModel> {
    const user = await this.userRepo.FindByIdOrThrow(Id.create(userIdValue));
    const email = data.email ? EmailVO.create(data.email) : user.email;
    if (data.email && !user.email.equals(email)) {
      const existing = await this.userRepo.FindByEmail(email);
      if (existing) throw new ConflictError('An account with this email already exists.');
    }
    if (data.name !== undefined || data.email !== undefined) {
      user.updateProfile(data.name ? this.createName(data.name) : user.name, email);
    }
    if (data.password) {
      user.changePassword(PasswordVO.create(await hashPassword(data.password)));
    }
    if (data.avatar !== undefined) {
      user.updateAvatar(await this.resolveAvatar(data.avatar, user.id));
    }
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMapper.aggregateToResponseReadModel(user);
  }

  async login(data: LoginUserType): Promise<{ token: string; user: UserResponseReadModel }> {
    const user = await this.userRepo.FindByEmailOrThrow(EmailVO.create(data.email));
    const valid = await verifyPassword(data.password, user.passwordHash.value);
    if (!valid) throw new BadRequestError('Invalid email or password.');

    user.loginUser();
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return {
      token: await this.issueToken(user),
      user: UserMapper.aggregateToResponseReadModel(user),
    };
  }

  /** Admin route (see user.routes.ts) — admin tier can see deleted/banned/blocked. */
  async getUserById(userId: string): Promise<UserResponseReadModel> {
    const user = await this.userRepo.FindByIdOrThrow(Id.create(userId), 'admin');
    return UserMapper.aggregateToResponseReadModel(user);
  }

  /** Batched public-tier lookup for cross-module consumers (QueryBus handler). */
  async getUsersByIds(ids: string[]): Promise<UserResponseReadModel[]> {
    if (ids.length === 0) return [];
    const users = await this.userRepo.FindByIds(
      ids.map((value) => Id.create(value)),
      'public',
    );
    return users.map((user) => UserMapper.aggregateToResponseReadModel(user));
  }

  async assignRole(data: AssignUserRoleType, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const actorId = actor.id;
    const userId = Id.create(data.userId);
    const role = UserRoleVO.create(data.role);
    const reason = Reason.create(data.reason);
    const user = await this.userRepo.FindByIdOrThrow(userId);
    const currentRole = user.role.role.value;
    const enrollmentRole =
      currentRole === 'student' || currentRole === 'teacher' ? currentRole : null;
    if (
      this.enrollmentRepo &&
      enrollmentRole &&
      enrollmentRole !== role.value &&
      (await this.enrollmentRepo.ExistsRoleEnrollment(userId, enrollmentRole))
    ) {
      throw new ConflictError('Remove the user from all classes before changing their role.');
    }
    user.assignRole(role, actorId, reason);
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.assignRole(userId, role, actorId);
  }

  async getMe(actor: Actor): Promise<UserResponseReadModel> {
    const user = await this.userRepo.FindByIdOrThrow(actor.id);
    return UserMapper.aggregateToResponseReadModel(user);
  }

  async softDeleteUser(data: DeleteUserType, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const actorId = actor.id;
    const userId = Id.create(data.userId);
    const user = await this.userRepo.FindByIdOrThrow(userId);
    user.deleteUser(actorId, Reason.create(data.reason));
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.delete(userId, actorId);
  }

  async recoverUser(userId: string, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const actorId = actor.id;
    const id = Id.create(userId);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.recoverUser(actorId);
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.recover(id, actorId);
  }

  async blockUser(data: BlockUserType, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const userId = Id.create(data.userId);
    const actorId = actor.id;
    const user = await this.userRepo.FindByIdOrThrow(userId);
    user.blockUser(actorId, Reason.create(data.reason));
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.block(userId, actorId);
  }

  async blockLift(userId: string, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const id = Id.create(userId);
    const actorId = actor.id;
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.unBlockUser(actorId);
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.blockLift(id, actorId);
  }

  async banUser(data: BanUserType, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const userId = Id.create(data.userId);
    const actorId = actor.id;
    const user = await this.userRepo.FindByIdOrThrow(userId);
    user.banUser(actorId, data.days, Reason.create(data.reason));
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.ban(userId, actorId, data.days);
  }

  async banLift(userId: string, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const id = Id.create(userId);
    const actorId = actor.id;
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.unBanUser(actorId);
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.banLift(id, actorId);
  }

  async extendBan(data: ExtendBanType, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const userId = Id.create(data.userId);
    const actorId = actor.id;
    const user = await this.userRepo.FindByIdOrThrow(userId);
    user.extendBan(actorId, data.days);
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.extendBan(userId, actorId, data.days);
  }

  async shortenBan(data: ExtendBanType, actor: Actor): Promise<UserMessagesType> {
    actor.assertAdmin();
    const userId = Id.create(data.userId);
    const actorId = actor.id;
    const user = await this.userRepo.FindByIdOrThrow(userId);
    user.shortenBan(actorId, data.days);
    await this.userRepo.Save(user);
    await this.publishEvents(user);
    return UserMessages.shortBan(userId, actorId, data.days);
  }

  async findPaginatedUsers(query: GetPaginatedUsersType) {
    // Public tier: visibility filter comes from the repo's domain policy now.
    const filter: Record<string, unknown> = {};
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter['name.fullName'] = { $regex: escaped, $options: 'i' };
    }
    const result = await this.userRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
      tier: 'public',
    });
    return {
      data: result.data.map((user) => UserMapper.aggregateToResponseReadModel(user)),
      meta: result.meta,
    };
  }

  async findAdminPaginatedUsers(query: GetAdminPaginatedUsersType) {
    const filter: Record<string, unknown> = {};
    // Admin tier — no visibility filter; explicit state filters come from the query.
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter['name.fullName'] = { $regex: escaped, $options: 'i' };
    }
    if (query.role) filter['role.role'] = query.role;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    if (query.blocked !== undefined) filter['block.blocked'] = query.blocked;
    if (query.banned !== undefined) filter['ban.banned'] = query.banned;
    const result = await this.userRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
      tier: 'admin',
    });
    return {
      data: result.data.map((user) => UserMapper.aggregateToResponseReadModel(user)),
      meta: result.meta,
    };
  }
}
