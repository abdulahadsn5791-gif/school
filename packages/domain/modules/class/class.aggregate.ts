import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { ClassCreatedEvent } from './events/class-created.event';
import { ClassDeletedEvent } from './events/class-deleted.event';
import { ClassRecoveredEvent } from './events/class-recovered.event';
import { ClassTeacherAssignedEvent } from './events/class-teacher-assigned.event';

type CreateClassProps = {
  id: Id;
  schoolId: Id;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId: Id | null;
};

export class ClassAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _name: Title,
    private readonly _grade: string,
    private readonly _section: string,
    private readonly _academicYear: string,
    private _classTeacherId: Id | null,
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

  get name() {
    return this._name;
  }

  get grade() {
    return this._grade;
  }

  get section() {
    return this._section;
  }

  get academicYear() {
    return this._academicYear;
  }

  get classTeacherId() {
    return this._classTeacherId;
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

  static create(props: CreateClassProps): ClassAggregate {
    const clazz = new ClassAggregate(
      props.id,
      props.schoolId,
      Title.create(props.name),
      props.grade,
      props.section,
      props.academicYear,
      props.classTeacherId,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    clazz.raise(new ClassCreatedEvent({ classId: clazz._id, schoolId: props.schoolId }));
    return clazz;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    name: string,
    grade: string,
    section: string,
    academicYear: string,
    classTeacherId: Id | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): ClassAggregate {
    return new ClassAggregate(
      id,
      schoolId,
      Title.rehydrate(name),
      grade,
      section,
      academicYear,
      classTeacherId,
      deleted,
      version,
    );
  }

  rename(name: string): void {
    if (this._name.value === name) return;
    this._name = Title.create(name);
  }

  assignClassTeacher(teacherId: Id | null): void {
    const unchanged =
      teacherId === null
        ? this._classTeacherId === null
        : this._classTeacherId?.equals(teacherId) === true;
    if (unchanged) return;
    this._classTeacherId = teacherId;
    if (teacherId) {
      this.raise(new ClassTeacherAssignedEvent({ classId: this._id, teacherId }));
    }
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) throw new BadRequestError('This class has already been deleted.');
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new ClassDeletedEvent({ classId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new ClassRecoveredEvent({ classId: this._id }));
  }
}
