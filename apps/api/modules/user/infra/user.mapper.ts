import {
  AvatarVO,
  BanInfoVO,
  BlockInfoVO,
  DeleteInfoVO,
  EffectiveDate,
  EmailVO,
  ExpirationDate,
  Id,
  NameInfoVO,
  PasswordVO,
  PersonName,
  Quantity,
  Reason,
  RoleInfoVO,
  UrlVO,
  UserAggregate,
  type UserReadModel,
  UserRoleVO,
} from '@ecomerece/domain';
import type { UserResponseReadModel } from '@ecomerece/shared';
import type { UserPersistence } from './user.models';

export const UserMapper = {
  persistenceToAggregate(doc: UserPersistence): UserAggregate {
    return UserAggregate.rehydrate(
      Id.create(doc._id),
      NameInfoVO.create(
        PersonName.create(doc.name.firstName),
        doc.name.middleName ? PersonName.create(doc.name.middleName) : null,
        doc.name.lastName ? PersonName.create(doc.name.lastName) : null,
      ),
      EmailVO.create(doc.email),
      AvatarVO.rehydrate(
        doc.avatar?.url ? UrlVO.create(doc.avatar.url) : null,
        doc.avatar?.publicId ?? null,
        doc.avatar?.createdOn ? EffectiveDate.create(doc.avatar.createdOn) : null,
      ),
      PasswordVO.create(doc.password),
      RoleInfoVO.rehydrate(
        UserRoleVO.create(doc.role.role),
        doc.role.from ? EffectiveDate.create(doc.role.from) : null,
        doc.role.assignedBy ? Id.create(doc.role.assignedBy) : null,
        doc.role.reason ? Reason.create(doc.role.reason) : null,
      ),
      BlockInfoVO.rehydrate(
        doc.block.blockedBy ? Id.create(doc.block.blockedBy) : null,
        doc.block.blocked,
        doc.block.blockedFrom ? EffectiveDate.create(doc.block.blockedFrom) : null,
        doc.block.reason ? Reason.create(doc.block.reason) : null,
      ),
      BanInfoVO.rehydrate(
        doc.ban.bannedBy ? Id.create(doc.ban.bannedBy) : null,
        doc.ban.from ? EffectiveDate.create(doc.ban.from) : null,
        doc.ban.until ? ExpirationDate.rehydrate(doc.ban.until) : null,
        doc.ban.reason ? Reason.create(doc.ban.reason) : null,
      ),
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.create(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      doc.lastLogin ? EffectiveDate.create(doc.lastLogin) : null,
      EffectiveDate.create(doc.createdAt),
      Quantity.rehydrate(doc.version),
    );
  },

  aggregateToPersistence(user: UserAggregate) {
    return {
      _id: user.id.value,
      name: {
        firstName: user.name.firstName.value,
        middleName: user.name.middleName?.value ?? null,
        lastName: user.name.lastName?.value ?? null,
        fullName: user.name.fullName,
      },
      email: user.email.value,
      password: user.passwordHash.value,
      avatar: user.avatar.toObject(),
      role: {
        role: user.role.role.value,
        from: user.role.from?.value ?? null,
        assignedBy: user.role.performedBy?.value ?? null,
        reason: user.role.reason?.value ?? null,
      },
      block: {
        blocked: user.block.blocked,
        blockedFrom: user.block.from?.value ?? null,
        blockedBy: user.block.performedBy?.value ?? null,
        reason: user.block.reason?.value ?? null,
      },
      ban: {
        banned: user.ban.isBan,
        from: user.ban.from?.value ?? null,
        until: user.ban.until?.value ?? null,
        bannedBy: user.ban.performedBy?.value ?? null,
        reason: user.ban.reason?.value ?? null,
      },
      deleted: {
        deleted: user.deleted.deleted,
        deletedFrom: user.deleted.from?.value ?? null,
        deletedBy: user.deleted.performedBy?.value ?? null,
        reason: user.deleted.reason?.value ?? null,
      },

      lastLogin: user.lastLogin?.value ?? null,
      createdAt: user.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(user: UserAggregate): UserReadModel {
    return {
      id: user.id.value,
      fullName: user.name.fullName,
      email: user.email.value,
      avatar: user.avatar.toObject(),
      role: user.role.role.value,
      isBlocked: user.block.blocked,
      isBanned: user.ban.isBan,
      bannedUntil: user.ban.until?.value ?? null,
      isDeleted: user.deleted.deleted,
      lastLogin: user.lastLogin?.value ?? null,
      createdAt: user.createdAt.value,
    };
  },
  persistenceToReadModel(user: UserPersistence): UserReadModel {
    return {
      id: user._id,
      fullName: user.name.fullName,
      email: user.email,
      avatar: user.avatar
        ? {
            url: user.avatar.url ?? null,
            publicId: user.avatar.publicId ?? null,
            createdOn: user.avatar.createdOn ?? null,
          }
        : null,
      role: user.role.role,
      isBlocked: user.block.blocked,
      isBanned: user.ban.banned,
      bannedUntil: user.ban.until ?? null,
      isDeleted: user.deleted.deleted,
      lastLogin: user.lastLogin ?? null,
      createdAt: user.createdAt,
    };
  },
  aggregateToResponseReadModel(user: UserAggregate): UserResponseReadModel {
    return {
      id: user.id.value,
      fullName: user.name.fullName,
      email: user.email.value,
      avatar: user.avatar.toObject(),
      role: user.role.role.value,
      isBlocked: user.block.blocked,
      isBanned: user.ban.isBan,
      isDeleted: user.deleted.deleted,
      bannedUntil: user.ban.until?.value ?? null,
      lastLogin: user.lastLogin?.value ?? null,
      createdAt: user.createdAt.value,
    };
  },
};
