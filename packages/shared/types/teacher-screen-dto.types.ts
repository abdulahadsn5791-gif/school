/**
 * Teacher timetable screen (new.md §6) — the engine returns the composed
 * screen; the frontend renders it. Mirrors TeacherTimetableScreenReadModel.
 */
export interface TeacherTimetableSlotDto {
  entryId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  periodId: string;
  periodName: string;
  periodOrder: number;
  startTime: string | null;
  endTime: string | null;
  classId: string;
  className: string;
  subjectName: string;
}

export interface TeacherTimetableScreenDto {
  schoolId: string | null;
  byDay: Array<{
    day: TeacherTimetableSlotDto['dayOfWeek'];
    slots: TeacherTimetableSlotDto[];
  }>;
  classes: Array<{ id: string; name: string }>;
  totalSlots: number;
  isTruncated: boolean;
}

/**
 * Teacher assignment index screen (new.md §6) — every live assignment the
 * signed-in teacher owns with class/subject labels resolved. Mirrors
 * TeacherAssignmentIndexScreenReadModel.
 */
export interface TeacherAssignmentIndexEntryDto {
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

export interface TeacherAssignmentIndexScreenDto {
  entries: TeacherAssignmentIndexEntryDto[];
  isTruncated: boolean;
}
