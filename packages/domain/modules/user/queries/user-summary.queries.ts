import type { UserRolesType } from '../value-objects/role-info.vo';

/**
 * The minimal user surface other modules may see through the QueryBus (new.md §4:
 * cross-module reads return read models, never aggregates or documents).
 */
export interface UserSummaryReadModel {
  id: string;
  fullName: string;
  role: UserRolesType;
  isDeleted: boolean;
}

/** Public tier: hidden users (deleted/banned/blocked) do not exist. */
export class GetUserSummaryByIdQuery {
  readonly __result?: UserSummaryReadModel;

  constructor(readonly id: string) {}
}

export class GetUserSummariesByIdsQuery {
  readonly __result?: UserSummaryReadModel[];

  constructor(readonly ids: string[]) {}
}
