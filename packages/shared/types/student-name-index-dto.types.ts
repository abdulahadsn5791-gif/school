/**
 * `GET /enrollments/student-names` — batched student identities for a set of
 * classes (new.md §6). Mirrors StudentNameIndexEntryReadModel.
 */
export interface StudentNameIndexEntryDto {
  classId: string;
  studentId: string;
  fullName: string;
  rollNumber: string | null;
}
