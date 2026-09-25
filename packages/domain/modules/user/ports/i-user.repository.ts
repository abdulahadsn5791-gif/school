import type { EmailVO, Id } from '../../../value-objects';
import type { UserAggregate } from '../user.aggregate';
import type { UserRolesType } from '../value-objects/role-info.vo';

export interface IUserRepository {
  FindById(id: Id): Promise<UserAggregate | null>;
  FindByEmail(email: EmailVO): Promise<UserAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<UserAggregate>;
  FindByIds(id: Id[]): Promise<UserAggregate[]>;
  FindByEmailOrThrow(email: EmailVO): Promise<UserAggregate>;
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
  }): Promise<{
    data: UserAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
