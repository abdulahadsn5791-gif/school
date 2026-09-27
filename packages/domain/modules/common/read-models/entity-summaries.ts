/**
 * Cross-module entity summaries (new.md §4/§5). QueryBus reads between modules
 * return these plain shapes — never aggregates, never persistence documents.
 * Public tier: hidden rows (deleted) do not exist for the caller.
 */
export interface SchoolSummaryReadModel {
  id: string;
  name: string;
  isDeleted: boolean;
}

export interface ClassSummaryReadModel {
  id: string;
  schoolId: string;
  academicYear: string;
  isDeleted: boolean;
}

export interface SubjectSummaryReadModel {
  id: string;
  schoolId: string;
  isDeleted: boolean;
}

export interface PeriodSummaryReadModel {
  id: string;
  schoolId: string;
  isDeleted: boolean;
}

export class GetSchoolSummaryByIdQuery {
  readonly __result?: SchoolSummaryReadModel;

  constructor(readonly id: string) {}
}

export class GetClassSummaryByIdQuery {
  readonly __result?: ClassSummaryReadModel;

  constructor(readonly id: string) {}
}

export class GetSubjectSummaryByIdQuery {
  readonly __result?: SubjectSummaryReadModel;

  constructor(readonly id: string) {}
}

export class GetPeriodSummaryByIdQuery {
  readonly __result?: PeriodSummaryReadModel;

  constructor(readonly id: string) {}
}
