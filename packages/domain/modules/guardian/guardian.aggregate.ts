import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';
import type { NameInfoVO } from '../user/value-objects/name-info.vo';
import { GuardianCreatedEvent } from './events/guardian-created.event';
import { GuardianDeletedEvent } from './events/guardian-deleted.event';
import { GuardianRecoveredEvent } from './events/guardian-recovered.event';
import { GuardianUpdatedEvent } from './events/guardian-updated.event';

type CreateGuardianProps = {
  id: Id;
  schoolId: Id;
  name: NameInfoVO;
  phone: string;
  email: string | null;
  occupation: string | null;
  userId: Id | null;
};

export class GuardianAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _name: NameInfoVO,
    private _phone: string,
    private _email: string | null,
    private _occupation: string | null,
    private readonly _userId: Id | null,
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

  get phone() {
    return this._phone;
  }

  get email() {
    return this._email;
  }

  get occupation() {
    return this._occupation;
  }

  get userId() {
    return this._userId;
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

  static create(props: CreateGuardianProps): GuardianAggregate {
    const phone = props.phone.trim();
    if (phone.length < 6 || phone.length > 20) {
      throw new BadRequestError('Guardian phone must be between 6 and 20 characters.');
    }
    if (props.email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      throw new BadRequestError('Guardian email is not valid.');
    }

    const guardian = new GuardianAggregate(
      props.id,
      props.schoolId,
      props.name,
      phone,
      props.email?.trim() || null,
      props.occupation?.trim() || null,
      props.userId,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    guardian.raise(
      new GuardianCreatedEvent({ guardianId: guardian._id, schoolId: props.schoolId }),
    );
    return guardian;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    name: NameInfoVO,
    phone: string,
    email: string | null,
    occupation: string | null,
    userId: Id | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): GuardianAggregate {
    return new GuardianAggregate(
      id,
      schoolId,
      name,
      phone,
      email,
      occupation,
      userId,
      deleted,
      version,
    );
  }

  updateProfile(
    name: NameInfoVO | undefined,
    phone: string | undefined,
    email: string | null | undefined,
    occupation: string | null | undefined,
  ): void {
    if (name !== undefined) this._name = name;
    if (phone !== undefined) {
      const trimmed = phone.trim();
      if (trimmed.length < 6 || trimmed.length > 20) {
        throw new BadRequestError('Guardian phone must be between 6 and 20 characters.');
      }
      this._phone = trimmed;
    }
    if (email !== undefined) {
      if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestError('Guardian email is not valid.');
      }
      this._email = email?.trim() || null;
    }
    if (occupation !== undefined) this._occupation = occupation?.trim() || null;
    this.raise(new GuardianUpdatedEvent({ guardianId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This guardian has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new GuardianDeletedEvent({ guardianId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new GuardianRecoveredEvent({ guardianId: this._id }));
  }
}
