import type { Id } from '../../../value-objects';
import type { DayOfWeek, TimetableEntryAggregate } from '../timetable.aggregate';

export interface ITimetableRepository {
  FindById(id: Id): Promise<TimetableEntryAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<TimetableEntryAggregate>;
  /** Live entries of a class for one academic year. */
  FindByClass(schoolId: Id, classId: Id, academicYear: string): Promise<TimetableEntryAggregate[]>;
  /** Live entries a teacher holds in one academic year. */
  FindByTeacher(
    schoolId: Id,
    teacherId: Id,
    academicYear: string,
  ): Promise<TimetableEntryAggregate[]>;
  /**
   * Live entry occupying a slot (class+year+day+period) or (teacher+year+day+period).
   * Used to guard the two partial unique indexes before writing.
   */
  FindSlotOccupant(params: {
    schoolId: Id;
    academicYear: string;
    dayOfWeek: DayOfWeek;
    periodId: Id;
    classId?: Id;
    teacherId?: Id;
    exceptEntryId?: Id;
  }): Promise<TimetableEntryAggregate | null>;
  Save(entry: TimetableEntryAggregate): Promise<void>;
  Create(entry: TimetableEntryAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: TimetableEntryAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
