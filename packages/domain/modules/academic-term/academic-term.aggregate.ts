import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { AcademicTermCreatedEvent } from './events/academic-term-created.event';
import { AcademicTermDeletedEvent } from './events/academic-term-deleted.event';
import { AcademicTermMarkedCurrentEvent } from './events/academic-term-marked-current.event';
import { AcademicTermRecoveredEvent } from './events/academic-term-recovered.event';

type CreateAcademicTermProps = {
  id: Id;
  schoolId: Id;
  academicYear: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

export class AcademicTermAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _academicYear: string,
    private _name: Title,
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private _isCurrent: boolean,
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

  get academicYear() {
    return this._academicYear;
  }

  get name() {
    return this._name;
  }

  get startDate() {
    return this._startDate;
  }

  get endDate() {
    return this._endDate;
  }

  get isCurrent() {
    return this._isCurrent;
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

  static create(props: CreateAcademicTermProps): AcademicTermAggregate {
    if (!/^\d{4}-\d{4}$/.test(props.academicYear)) {
      throw new BadRequestError('Academic year must look like 2026-2027.');
    }
    if (props.endDate.getTime() <= props.startDate.getTime()) {
      throw new BadRequestError('Term end date must be after the start date.');
    }

    const term = new AcademicTermAggregate(
      props.id,
      props.schoolId,
      props.academicYear,
      Title.create(props.name),
      props.startDate,
      props.endDate,
      props.isCurrent,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    term.raise(new AcademicTermCreatedEvent({ termId: term._id, schoolId: props.schoolId }));
    if (props.isCurrent) {
      term.raise(new AcademicTermMarkedCurrentEvent({ termId: term._id }));
    }
    return term;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    academicYear: string,
    name: string,
    startDate: Date,
    endDate: Date,
    isCurrent: boolean,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): AcademicTermAggregate {
    return new AcademicTermAggregate(
      id,
      schoolId,
      academicYear,
      Title.rehydrate(name),
      startDate,
      endDate,
      isCurrent,
      deleted,
      version,
    );
  }

  rename(name: string): void {
    if (this._name.value === name) return;
    this._name = Title.create(name);
  }

  markCurrent(isCurrent: boolean): void {
    if (this._isCurrent === isCurrent) return;
    this._isCurrent = isCurrent;
    if (isCurrent) {
      this.raise(new AcademicTermMarkedCurrentEvent({ termId: this._id }));
    }
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This term has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new AcademicTermDeletedEvent({ termId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new AcademicTermRecoveredEvent({ termId: this._id }));
  }
}
