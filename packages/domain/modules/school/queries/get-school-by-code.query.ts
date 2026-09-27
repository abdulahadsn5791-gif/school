/** Result of resolving a school's human key (new.md §5). Null-safe shape. */
export interface SchoolIdReadModel {
  id: string;
}

/** Human-key resolution for sibling modules: school code → school Id. */
export class GetSchoolByCodeQuery {
  readonly __result?: SchoolIdReadModel | null;

  constructor(readonly code: string) {}
}
