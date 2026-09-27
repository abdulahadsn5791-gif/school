import type { EmailVO, Id } from '../../../value-objects';
import type { ActorTier } from '../policies/actor-tier';
import type { UserAggregate } from '../user.aggregate';
import type { UserRolesType } from '../value-objects/role-info.vo';

export interface IUserRepository {
  /** Two-tier point read (new.md §3): public tier hides deleted/banned/blocked. */
  FindById(id: Id, tier?: ActorTier): Promise<UserAggregate | null>;
  FindByEmail(email: EmailVO, tier?: ActorTier): Promise<UserAggregate | null>;
  /** Public tier throws the same NotFoundError for hidden and missing rows. */
  FindByIdOrThrow(id: Id, tier?: ActorTier): Promise<UserAggregate>;
  FindByIds(ids: Id[], tier?: ActorTier): Promise<UserAggregate[]>;
  FindByEmailOrThrow(email: EmailVO, tier?: ActorTier): Promise<UserAggregate>;
  Save(user: UserAggregate): Promise<void>;
  Create(add: UserAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  /** Cheap indexed existence check — used to bootstrap the first admin without a full count scan. */
  ExistsAnyByRole(role: UserRolesType): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
    tier?: ActorTier;
  }): Promise<{
    data: UserAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
