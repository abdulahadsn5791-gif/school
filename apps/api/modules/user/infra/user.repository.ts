import {
  type ActorTier,
  type EmailVO,
  type Id,
  type IUserRepository,
  USER_PUBLIC_VISIBILITY,
  type UserAggregate,
} from '@ecomerece/domain';
import type { UserRolesType } from '@ecomerece/domain/modules/user/value-objects/role-info.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { UserMapper } from './user.mapper';
import { UserModel, type UserPersistence } from './user.models';

/**
 * PUBLIC tier filter composed from the domain-owned policy (new.md §3):
 * deleted / banned / blocked users do not exist for public callers.
 */
const PUBLIC_VISIBILITY = USER_PUBLIC_VISIBILITY as unknown as Record<string, unknown>;

export class UserRepository extends MongoRepository<UserPersistence> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async FindById(id: Id, tier: ActorTier = 'public'): Promise<UserAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    if (tier === 'admin') return UserMapper.persistenceToAggregate(doc);
    return PUBLIC_VISIBILITY_SATISFIED(doc) ? UserMapper.persistenceToAggregate(doc) : null;
  }

  async FindByIds(ids: Id[], tier: ActorTier = 'public'): Promise<UserAggregate[]> {
    const values = ids.map((value) => value.value);
    const docs = await super.find({
      _id: { $in: values },
      ...(tier === 'admin' ? {} : PUBLIC_VISIBILITY),
    } as FilterQuery<UserPersistence>);
    return docs.map((value) => UserMapper.persistenceToAggregate(value));
  }

  async FindByEmail(email: EmailVO, tier: ActorTier = 'public'): Promise<UserAggregate | null> {
    const doc = await super.findOne({
      email: email.value,
      ...(tier === 'admin' ? {} : PUBLIC_VISIBILITY),
    } as FilterQuery<UserPersistence>);
    if (!doc) return null;
    return UserMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id, tier: ActorTier = 'public'): Promise<UserAggregate> {
    const user = await this.FindById(id, tier);
    // Deliberately identical message for missing AND hidden rows (no existence leak).
    if (!user) throw new NotFoundError('User not found.');
    return user;
  }

  async FindByEmailOrThrow(email: EmailVO, tier: ActorTier = 'public'): Promise<UserAggregate> {
    const user = await this.FindByEmail(email, tier);
    if (!user) throw new NotFoundError('No user exists with this email.');
    return user;
  }

  async Save(user: UserAggregate): Promise<void> {
    const {
      _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...data
    } = UserMapper.aggregateToPersistence(user);

    const result = await UserModel.updateOne(
      { _id, version: user.version.value },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Create(add: UserAggregate): Promise<void> {
    const persistantUser = UserMapper.aggregateToPersistence(add);
    const userDoc = new UserModel(persistantUser);
    await userDoc.save({ session: this.session });
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async ExistsAnyByRole(role: UserRolesType): Promise<boolean> {
    const doc = await UserModel.exists({ 'role.role': role })
      .select({ _id: 1 })
      .limit(1)
      .session(this.session ?? null);
    return !!doc;
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
    tier?: ActorTier;
  }): Promise<{
    data: UserAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const visibility = params.tier === 'admin' ? {} : PUBLIC_VISIBILITY;
    const result = await this.paginateByCursor({
      filter: {
        ...visibility,
        ...(params.filter ?? {}),
      } as FilterQuery<UserPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => UserMapper.persistenceToAggregate(doc as UserPersistence)),
      meta: result.meta,
    };
  }
}

/** In-memory visibility check used when a document is already loaded (public tier). */
function PUBLIC_VISIBILITY_SATISFIED(doc: UserPersistence): boolean {
  return !(
    doc.deleted?.deleted === true ||
    doc.ban?.banned === true ||
    doc.block?.blocked === true
  );
}
