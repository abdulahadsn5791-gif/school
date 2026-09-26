import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';
import { ReportCreatedEvent } from './events/report-created.event';
import { ReportDeletedEvent } from './events/report-deleted.event';
import { ReportUpdatedEvent } from './events/report-updated.event';

export type SubjectGrade = {
  subjectId: string;
  homeworkMarks: number;
  testMarks: number;
  oralMarks: number;
  totalObtained: number;
  maxMarks: number;
  grade: string;
  teacherRemarks: string | null;
};

type CreateReportProps = {
  id: Id;
  schoolId: Id;
  studentId: Id;
  classId: Id;
  termId: Id;
  academicYear: string;
  subjects: SubjectGrade[];
  overallPercentage: number;
  overallGrade: string;
  attendancePercentage: number | null;
  generalRemarks: string | null;
  generatedBy: Id;
};

const YEAR_RE = /^\d{4}-\d{4}$/;

export class ReportAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _studentId: Id,
    private readonly _classId: Id,
    private readonly _termId: Id,
    private readonly _academicYear: string,
    private _subjects: SubjectGrade[],
    private _overallPercentage: number,
    private _overallGrade: string,
    private _attendancePercentage: number | null,
    private _generalRemarks: string | null,
    private readonly _generatedBy: Id,
    private _deleted: DeleteInfoVO,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }

  get schoolId() {
    return this._schoolId;
  }

  get studentId() {
    return this._studentId;
  }

  get classId() {
    return this._classId;
  }

  get termId() {
    return this._termId;
  }

  get academicYear() {
    return this._academicYear;
  }

  get subjects() {
    return [...this._subjects];
  }

  get overallPercentage() {
    return this._overallPercentage;
  }

  get overallGrade() {
    return this._overallGrade;
  }

  get attendancePercentage() {
    return this._attendancePercentage;
  }

  get generalRemarks() {
    return this._generalRemarks;
  }

  get generatedBy() {
    return this._generatedBy;
  }

  get deleted() {
    return this._deleted;
  }

  get version() {
    return this._version;
  }

  get isDeleted(): boolean {
    return this._deleted.isDeleted;
  }

  private static validatePercentage(value: number, label: string): void {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new BadRequestError(`${label} must be between 0 and 100.`);
    }
  }

  static create(props: CreateReportProps): ReportAggregate {
    if (!YEAR_RE.test(props.academicYear)) {
      throw new BadRequestError('Academic year must look like 2026-2027.');
    }
    ReportAggregate.validatePercentage(props.overallPercentage, 'Overall percentage');
    if (props.overallGrade.trim().length === 0) {
      throw new BadRequestError('Overall grade is required.');
    }
    if (props.attendancePercentage !== null) {
      ReportAggregate.validatePercentage(props.attendancePercentage, 'Attendance percentage');
    }
    const subjectIds = new Set(props.subjects.map((s) => s.subjectId));
    if (subjectIds.size !== props.subjects.length) {
      throw new BadRequestError('Each subject may appear only once in a report.');
    }
    for (const subject of props.subjects) {
      if (subject.totalObtained > subject.maxMarks) {
        throw new BadRequestError('Obtained marks cannot exceed the maximum marks.');
      }
    }

    const report = new ReportAggregate(
      props.id,
      props.schoolId,
      props.studentId,
      props.classId,
      props.termId,
      props.academicYear,
      props.subjects.map((s) => ({ ...s })),
      props.overallPercentage,
      props.overallGrade.trim(),
      props.attendancePercentage,
      props.generalRemarks?.trim() || null,
      props.generatedBy,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    report.raise(new ReportCreatedEvent({ reportId: report._id, studentId: props.studentId }));
    return report;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    studentId: Id,
    classId: Id,
    termId: Id,
    academicYear: string,
    subjects: SubjectGrade[],
    overallPercentage: number,
    overallGrade: string,
    attendancePercentage: number | null,
    generalRemarks: string | null,
    generatedBy: Id,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): ReportAggregate {
    return new ReportAggregate(
      id,
      schoolId,
      studentId,
      classId,
      termId,
      academicYear,
      subjects.map((s) => ({ ...s })),
      overallPercentage,
      overallGrade,
      attendancePercentage,
      generalRemarks,
      generatedBy,
      deleted,
      version,
    );
  }

  update(
    subjects: SubjectGrade[] | undefined,
    overallPercentage: number | undefined,
    overallGrade: string | undefined,
    attendancePercentage: number | null | undefined,
    generalRemarks: string | null | undefined,
  ): void {
    if (subjects !== undefined) {
      const subjectIds = new Set(subjects.map((s) => s.subjectId));
      if (subjectIds.size !== subjects.length) {
        throw new BadRequestError('Each subject may appear only once in a report.');
      }
      for (const subject of subjects) {
        if (subject.totalObtained > subject.maxMarks) {
          throw new BadRequestError('Obtained marks cannot exceed the maximum marks.');
        }
      }
      this._subjects = subjects.map((s) => ({ ...s }));
    }
    if (overallPercentage !== undefined) {
      ReportAggregate.validatePercentage(overallPercentage, 'Overall percentage');
      this._overallPercentage = overallPercentage;
    }
    if (overallGrade !== undefined) {
      if (overallGrade.trim().length === 0) {
        throw new BadRequestError('Overall grade is required.');
      }
      this._overallGrade = overallGrade.trim();
    }
    if (attendancePercentage !== undefined) {
      if (attendancePercentage !== null) {
        ReportAggregate.validatePercentage(attendancePercentage, 'Attendance percentage');
      }
      this._attendancePercentage = attendancePercentage;
    }
    if (generalRemarks !== undefined) this._generalRemarks = generalRemarks?.trim() || null;
    this.raise(new ReportUpdatedEvent({ reportId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This report has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new ReportDeletedEvent({ reportId: this._id }));
  }
}
