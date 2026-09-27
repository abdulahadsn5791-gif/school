/**
 * One student on a class roster, with the name resolved for display
 * (the engine-owned shape behind `GET /enrollments/roster`).
 */
export interface ClassRosterEntryReadModel {
  studentId: string;
  fullName: string;
  rollNumber: string | null;
}

/**
 * One resolved student identity, scoped to the class that was asked for (a
 * student's name is global, but the roll number is per class).
 */
export interface StudentNameIndexEntryReadModel {
  classId: string;
  studentId: string;
  fullName: string;
  rollNumber: string | null;
}

/**
 * Batched roster read for sibling modules (new.md §4/§6). Runs at public tier
 * and without actor checks — the CALLING module authorizes the class before
 * asking for its roster, exactly as `GetUserSummariesByIdsQuery` callers do.
 */
export class GetClassRosterQuery {
  readonly __result?: ClassRosterEntryReadModel[];

  constructor(readonly classId: string) {}
}
