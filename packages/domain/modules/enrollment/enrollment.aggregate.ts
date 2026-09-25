import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';
import { EnrollmentCreatedEvent } from './events/enrollment-created.event';
import { EnrollmentDeletedEvent } from './events/enrollment-deleted.event';
import { EnrollmentRecoveredEvent } from './events/enrollment-recovered.event';
import { EnrollmentRollAssignedEvent } from './events/enrollment-roll-assigned.event';

type CreateEnrollmentProps = {
  id: Id;
  schoolId: Id;
  studentId: Id;
  classId: Id;
  rollNumber: string | null;
  academicYear: string;
};

export class EnrollmentAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _studentId: Id,
    private _classId: Id,
    private _rollNumber: string | null,
    private readonly _academicYear: string,
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

  get rollNumber() {
    return this._rollNumber;
  }

  get academicYear() {
    return this._academicYear;
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

  static create(props: CreateEnrollmentProps): EnrollmentAggregate {
    const enrollment = new EnrollmentAggregate(
      props.id,
      props.schoolId,
      props.studentId,
      props.classId,
      props.rollNumber,
      props.academicYear,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    enrollment.raise(
      new EnrollmentCreatedEvent({ enrollmentId: enrollment._id, studentId: props.studentId }),
    );
    return enrollment;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    studentId: Id,
    classId: Id,
    rollNumber: string | null,
    academicYear: string,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): EnrollmentAggregate {
    return new EnrollmentAggregate(
      id,
      schoolId,
      studentId,
      classId,
      rollNumber,
      academicYear,
      deleted,
      version,
    );
  }

  assignClass(classId: Id): void {
    if (this._classId.equals(classId)) return;
    this._classId = classId;
  }

  assignRollNumber(rollNumber: string | null): void {
    if (this._rollNumber === rollNumber) return;
    this._rollNumber = rollNumber;
    if (rollNumber) {
      this.raise(new EnrollmentRollAssignedEvent({ enrollmentId: this._id, rollNumber }));
    }
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new EnrollmentDeletedEvent({ enrollmentId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new EnrollmentRecoveredEvent({ enrollmentId: this._id }));
  }
}
