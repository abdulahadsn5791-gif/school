import type { SubjectReadModel } from '../read-models/subject.read-model';

/** Batch subject lookup by ids (new.md §6: batched with `$in`, never N+1). */
export class GetSubjectsByIdsQuery {
  readonly __result?: SubjectReadModel[];

  constructor(readonly ids: string[]) {}
}
