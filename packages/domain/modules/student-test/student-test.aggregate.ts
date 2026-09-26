import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';
import { StudentTestCreatedEvent } from './events/student-test-created.event';
import { StudentTestDeletedEvent } from './events/student-test-deleted.event';
import { StudentTestGradedEvent } from './events/student-test-graded.event';
import { StudentTestSubmittedEvent } from './events/student-test-submitted.event';

export type StudentTestStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'MISSED';

type CreateStudentTestProps = {
  id: Id;
  schoolId: Id;
  assignmentId: Id;
  studentId: Id;
};

export class StudentTestAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _assignmentId: Id,
    private readonly _studentId: Id,
    private _status: StudentTestStatus,
    private _submissionText: string | null,
    private _submissionFiles: string[],
    private _submittedAt: Date | null,
    private _marksObtained: number | null,
    private _teacherFeedback: string | null,
    private _gradedBy: Id | null,
    private _gradedAt: Date | null,
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

  get assignmentId() {
    return this._assignmentId;
  }

  get studentId() {
    return this._studentId;
  }

  get status() {
    return this._status;
  }

  get submissionText() {
    return this._submissionText;
  }

  get submissionFiles() {
    return [...this._submissionFiles];
  }

  get submittedAt() {
    return this._submittedAt;
  }

  get marksObtained() {
    return this._marksObtained;
  }

  get teacherFeedback() {
    return this._teacherFeedback;
  }

  get gradedBy() {
    return this._gradedBy;
  }

  get gradedAt() {
    return this._gradedAt;
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

  static create(props: CreateStudentTestProps): StudentTestAggregate {
    const submission = new StudentTestAggregate(
      props.id,
      props.schoolId,
      props.assignmentId,
      props.studentId,
      'PENDING',
      null,
      [],
      null,
      null,
      null,
      null,
      null,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    submission.raise(
      new StudentTestCreatedEvent({
        submissionId: submission._id,
        assignmentId: props.assignmentId,
      }),
    );
    return submission;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    assignmentId: Id,
    studentId: Id,
    status: StudentTestStatus,
    submissionText: string | null,
    submissionFiles: string[],
    submittedAt: Date | null,
    marksObtained: number | null,
    teacherFeedback: string | null,
    gradedBy: Id | null,
    gradedAt: Date | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): StudentTestAggregate {
    return new StudentTestAggregate(
      id,
      schoolId,
      assignmentId,
      studentId,
      status,
      submissionText,
      [...submissionFiles],
      submittedAt,
      marksObtained,
      teacherFeedback,
      gradedBy,
      gradedAt,
      deleted,
      version,
    );
  }

  submit(text: string | null, files: string[] | undefined): void {
    if (this._status === 'GRADED') {
      throw new BadRequestError('This submission has already been graded.');
    }
    if (this._status === 'MISSED') {
      throw new BadRequestError('This submission was marked as missed.');
    }
    if ((text === null || !text.trim()) && (!files || files.length === 0)) {
      throw new BadRequestError('Provide submission text or at least one file.');
    }
    this._submissionText = text?.trim() || null;
    if (files !== undefined) this._submissionFiles = [...files];
    this._submittedAt = new Date();
    this._status = 'SUBMITTED';
    this.raise(new StudentTestSubmittedEvent({ submissionId: this._id }));
  }

  markMissed(): void {
    if (this._status === 'GRADED') {
      throw new BadRequestError('A graded submission cannot be marked as missed.');
    }
    if (this._status === 'MISSED') return;
    this._status = 'MISSED';
  }

  grade(marks: number, feedback: string | null, grader: Id): void {
    if (this._status !== 'SUBMITTED') {
      throw new BadRequestError('Only submitted work can be graded.');
    }
    if (!Number.isFinite(marks) || marks < 0) {
      throw new BadRequestError('Marks cannot be negative.');
    }
    this._marksObtained = marks;
    this._teacherFeedback = feedback?.trim() || null;
    this._gradedBy = grader;
    this._gradedAt = new Date();
    this._status = 'GRADED';
    this.raise(new StudentTestGradedEvent({ submissionId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This submission has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new StudentTestDeletedEvent({ submissionId: this._id }));
  }
}
