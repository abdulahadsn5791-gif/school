import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';
import { LeaveApprovedEvent } from './events/leave-approved.event';
import { LeaveDeletedEvent } from './events/leave-deleted.event';
import { LeaveRejectedEvent } from './events/leave-rejected.event';
import { LeaveSubmittedEvent } from './events/leave-submitted.event';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LeaveApplicantRole = 'student' | 'teacher';

type CreateLeaveProps = {
  id: Id;
  schoolId: Id;
  applicantId: Id;
  applicantRole: LeaveApplicantRole;
  classId: Id | null;
  fromDate: Date;
  toDate: Date;
  reason: string;
};

export class LeaveAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _applicantId: Id,
    private readonly _applicantRole: LeaveApplicantRole,
    private readonly _classId: Id | null,
    private _fromDate: Date,
    private _toDate: Date,
    private _reason: string,
    private _status: LeaveStatus,
    private _reviewedBy: Id | null,
    private _reviewedAt: Date | null,
    private _reviewRemark: string | null,
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

  get applicantId() {
    return this._applicantId;
  }

  get applicantRole() {
    return this._applicantRole;
  }

  get classId() {
    return this._classId;
  }

  get fromDate() {
    return this._fromDate;
  }

  get toDate() {
    return this._toDate;
  }

  get reason() {
    return this._reason;
  }

  get status() {
    return this._status;
  }

  get reviewedBy() {
    return this._reviewedBy;
  }

  get reviewedAt() {
    return this._reviewedAt;
  }

  get reviewRemark() {
    return this._reviewRemark;
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

  static create(props: CreateLeaveProps): LeaveAggregate {
    if (props.toDate.getTime() < props.fromDate.getTime()) {
      throw new BadRequestError('Leave end date cannot be before the start date.');
    }
    if (props.reason.trim().length < 10) {
      throw new BadRequestError('Leave reason must be at least 10 characters.');
    }
    if (props.applicantRole === 'student' && props.classId === null) {
      throw new BadRequestError('A class is required for student leave applications.');
    }

    const leave = new LeaveAggregate(
      props.id,
      props.schoolId,
      props.applicantId,
      props.applicantRole,
      props.classId,
      props.fromDate,
      props.toDate,
      props.reason.trim(),
      'PENDING',
      null,
      null,
      null,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    leave.raise(new LeaveSubmittedEvent({ leaveId: leave._id, applicantId: props.applicantId }));
    return leave;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    applicantId: Id,
    applicantRole: LeaveApplicantRole,
    classId: Id | null,
    fromDate: Date,
    toDate: Date,
    reason: string,
    status: LeaveStatus,
    reviewedBy: Id | null,
    reviewedAt: Date | null,
    reviewRemark: string | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): LeaveAggregate {
    return new LeaveAggregate(
      id,
      schoolId,
      applicantId,
      applicantRole,
      classId,
      fromDate,
      toDate,
      reason,
      status,
      reviewedBy,
      reviewedAt,
      reviewRemark,
      deleted,
      version,
    );
  }

  approve(reviewer: Id, remark: string | null): void {
    if (this._status !== 'PENDING') {
      throw new BadRequestError('Only pending leave applications can be approved.');
    }
    if (this._applicantId.equals(reviewer)) {
      throw new BadRequestError('You cannot review your own leave application.');
    }
    this._status = 'APPROVED';
    this._reviewedBy = reviewer;
    this._reviewedAt = new Date();
    this._reviewRemark = remark?.trim() || null;
    this.raise(new LeaveApprovedEvent({ leaveId: this._id }));
  }

  reject(reviewer: Id, remark: string | null): void {
    if (this._status !== 'PENDING') {
      throw new BadRequestError('Only pending leave applications can be rejected.');
    }
    if (this._applicantId.equals(reviewer)) {
      throw new BadRequestError('You cannot review your own leave application.');
    }
    this._status = 'REJECTED';
    this._reviewedBy = reviewer;
    this._reviewedAt = new Date();
    this._reviewRemark = remark?.trim() || null;
    this.raise(new LeaveRejectedEvent({ leaveId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This leave application has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new LeaveDeletedEvent({ leaveId: this._id }));
  }
}
