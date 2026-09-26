import type { Id } from '../../../value-objects';
import type { GuardianAggregate } from '../guardian.aggregate';

export interface IGuardianRepository {
  FindById(id: Id): Promise<GuardianAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<GuardianAggregate>;
  /** Live guardians of a school, optionally matching a phone number. */
  FindBySchool(schoolId: Id): Promise<GuardianAggregate[]>;
  FindByPhone(schoolId: Id, phone: string): Promise<GuardianAggregate | null>;
  Save(guardian: GuardianAggregate): Promise<void>;
  Create(guardian: GuardianAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: GuardianAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
