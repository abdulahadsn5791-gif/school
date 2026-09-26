import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { AssignmentCreatedEvent } from './events/assignment-created.event';
import { AssignmentDeletedEvent } from './events/assignment-deleted.event';
import { AssignmentRecoveredEvent } from './events/assignment-recovered.event';
import { AssignmentUpdatedEvent } from './events/assignment-updated.event';

export type AssignmentType = 'homework' | 'test' | 'oral';

const TYPES: AssignmentType[] = ['homework', 'test', 'oral'];

type CreateAssignmentProps = {
  id: Id;
  schoolId: Id;
  title: string;
  description: string | null;
  type: AssignmentType;
  classId: Id;
  subjectId: Id;
  teacherId: Id;
  assignedDate: Date;
  dueDate: Date;
  totalMarks: number;
  attachments: string[];
};

export class AssignmentAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _title: Title,
    private _description: string | null,
    private _type: AssignmentType,
    private readonly _classId: Id,
    private readonly _subjectId: Id,
    private readonly _teacherId: Id,
    private _assignedDate: Date,
    private _dueDate: Date,
    private _totalMarks: number,
    private _attachments: string[],
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

  get title() {
    return this._title;
  }

  get description() {
    return this._description;
  }

  get type() {
    return this._type;
  }

  get classId() {
    return this._classId;
  }

  get subjectId() {
    return this._subjectId;
  }

  get teacherId() {
    return this._teacherId;
  }

  get assignedDate() {
    return this._assignedDate;
  }

  get dueDate() {
    return this._dueDate;
  }

  get totalMarks() {
    return this._totalMarks;
  }

  get attachments() {
    return [...this._attachments];
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

  static create(props: CreateAssignmentProps): AssignmentAggregate {
    if (!TYPES.includes(props.type)) {
      throw new BadRequestError('Assignment type is not supported.');
    }
    if (props.dueDate.getTime() < props.assignedDate.getTime()) {
      throw new BadRequestError('Assignment due date cannot be before the assigned date.');
    }
    if (!Number.isFinite(props.totalMarks) || props.totalMarks <= 0 || props.totalMarks > 1000) {
      throw new BadRequestError('Total marks must be between 1 and 1000.');
    }

    const assignment = new AssignmentAggregate(
      props.id,
      props.schoolId,
      Title.create(props.title),
      props.description?.trim() || null,
      props.type,
      props.classId,
      props.subjectId,
      props.teacherId,
      props.assignedDate,
      props.dueDate,
      props.totalMarks,
      [...props.attachments],
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    assignment.raise(
      new AssignmentCreatedEvent({ assignmentId: assignment._id, classId: props.classId }),
    );
    return assignment;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    title: string,
    description: string | null,
    type: AssignmentType,
    classId: Id,
    subjectId: Id,
    teacherId: Id,
    assignedDate: Date,
    dueDate: Date,
    totalMarks: number,
    attachments: string[],
    deleted: DeleteInfoVO,
    version: Quantity,
  ): AssignmentAggregate {
    return new AssignmentAggregate(
      id,
      schoolId,
      Title.rehydrate(title),
      description,
      type,
      classId,
      subjectId,
      teacherId,
      assignedDate,
      dueDate,
      totalMarks,
      [...attachments],
      deleted,
      version,
    );
  }

  update(
    title: string | undefined,
    description: string | null | undefined,
    dueDate: Date | undefined,
    totalMarks: number | undefined,
    attachments: string[] | undefined,
  ): void {
    const nextDue = dueDate ?? this._dueDate;
    if (nextDue.getTime() < this._assignedDate.getTime()) {
      throw new BadRequestError('Assignment due date cannot be before the assigned date.');
    }
    if (totalMarks !== undefined) {
      if (!Number.isFinite(totalMarks) || totalMarks <= 0 || totalMarks > 1000) {
        throw new BadRequestError('Total marks must be between 1 and 1000.');
      }
      this._totalMarks = totalMarks;
    }

    if (title !== undefined && title !== this._title.value) this._title = Title.create(title);
    if (description !== undefined) this._description = description?.trim() || null;
    this._dueDate = nextDue;
    if (attachments !== undefined) this._attachments = [...attachments];
    this.raise(new AssignmentUpdatedEvent({ assignmentId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This assignment has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new AssignmentDeletedEvent({ assignmentId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new AssignmentRecoveredEvent({ assignmentId: this._id }));
  }
}
