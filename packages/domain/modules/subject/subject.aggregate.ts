import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { SubjectCreatedEvent } from './events/subject-created.event';
import { SubjectDeletedEvent } from './events/subject-deleted.event';
import { SubjectRecoveredEvent } from './events/subject-recovered.event';
import { SubjectRenamedEvent } from './events/subject-renamed.event';

type CreateSubjectProps = {
  id: Id;
  schoolId: Id;
  name: string;
  code: string;
};

export class SubjectAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _name: Title,
    private readonly _code: string,
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

  get code() {
    return this._code;
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

  static create(props: CreateSubjectProps): SubjectAggregate {
    const code = props.code.trim().toUpperCase();
    if (code.length < 2 || code.length > 30) {
      throw new BadRequestError('Subject code must be between 2 and 30 characters.');
    }

    const subject = new SubjectAggregate(
      props.id,
      props.schoolId,
      Title.create(props.name),
      code,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    subject.raise(new SubjectCreatedEvent({ subjectId: subject._id, schoolId: props.schoolId }));
    return subject;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    name: string,
    code: string,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): SubjectAggregate {
    return new SubjectAggregate(id, schoolId, Title.rehydrate(name), code, deleted, version);
  }

  rename(name: string): void {
    if (this._name.value === name) return;
    this._name = Title.create(name);
    this.raise(new SubjectRenamedEvent({ subjectId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This subject has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new SubjectDeletedEvent({ subjectId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new SubjectRecoveredEvent({ subjectId: this._id }));
  }
}
