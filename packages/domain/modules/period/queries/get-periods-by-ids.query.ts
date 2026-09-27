import type { PeriodReadModel } from '../read-models/period.read-model';

/** Batch period lookup by ids (new.md §6: batched with `$in`, never N+1). */
export class GetPeriodsByIdsQuery {
  readonly __result?: PeriodReadModel[];

  constructor(readonly ids: string[]) {}
}
