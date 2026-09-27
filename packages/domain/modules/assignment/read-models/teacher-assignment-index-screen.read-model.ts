/**
 * One row of the teacher assignment index (new.md §6): the assignment facts a
 * teacher's assignment list and grading queue render, with class and subject
 * names already resolved server-side.
 */
export interface TeacherAssignmentIndexEntryReadModel {
  id: string;
  title: string;
  type: 'homework' | 'test' | 'oral';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  assignedDate: Date;
  dueDate: Date;
  totalMarks: number;
}

/**
 * `GET /assignments/screen/teacher` — every live assignment the signed-in
 * teacher owns, labels resolved. Replaces the client join (assignments page)
 * and the paged index hook (grading page).
 */
export interface TeacherAssignmentIndexScreenReadModel {
  entries: TeacherAssignmentIndexEntryReadModel[];
  /** True when the entry source hit its safety cap and may be incomplete. */
  isTruncated: boolean;
}
