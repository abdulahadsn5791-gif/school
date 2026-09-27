import type { ClassReadModel } from '../read-models/class.read-model';

/** Batch class lookup by ids (new.md §6: batched with `$in`, never N+1). */
export class GetClassesByIdsQuery {
  readonly __result?: ClassReadModel[];

  constructor(readonly ids: string[]) {}
}
