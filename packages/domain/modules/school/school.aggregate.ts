import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { SchoolCreatedEvent } from './events/school-created.event';
import { SchoolDeletedEvent } from './events/school-deleted.event';
import { SchoolProfileUpdatedEvent } from './events/school-profile-updated.event';
import { SchoolRecoveredEvent } from './events/school-recovered.event';

type CreateSchoolProps = {
  id: Id;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  timezone: string;
};

export class SchoolAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private _name: Title,
    private readonly _code: string,
    private _address: string | null,
    private _phone: string | null,
    private _email: string | null,
    private _logoUrl: string | null,
    private _timezone: string,
    private _deleted: DeleteInfoVO,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get code() {
    return this._code;
  }

  get address() {
    return this._address;
  }

  get phone() {
    return this._phone;
  }

  get email() {
    return this._email;
  }

  get logoUrl() {
    return this._logoUrl;
  }

  get timezone() {
    return this._timezone;
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

  static create(props: CreateSchoolProps): SchoolAggregate {
    const code = props.code.trim().toUpperCase();
    if (code.length < 2 || code.length > 20) {
      throw new BadRequestError('School code must be between 2 and 20 characters.');
    }
    if (props.email !== null && !EmailLike.isValid(props.email)) {
      throw new BadRequestError('School email is not valid.');
    }
    if (props.logoUrl !== null && !UrlLike.isValid(props.logoUrl)) {
      throw new BadRequestError('School logo URL is not valid.');
    }

    const school = new SchoolAggregate(
      props.id,
      Title.create(props.name),
      code,
      props.address?.trim() || null,
      props.phone?.trim() || null,
      props.email?.trim() || null,
      props.logoUrl?.trim() || null,
      props.timezone,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    school.raise(new SchoolCreatedEvent({ schoolId: school._id, code: school._code }));
    return school;
  }

  static rehydrate(
    id: Id,
    name: string,
    code: string,
    address: string | null,
    phone: string | null,
    email: string | null,
    logoUrl: string | null,
    timezone: string,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): SchoolAggregate {
    return new SchoolAggregate(
      id,
      Title.rehydrate(name),
      code,
      address,
      phone,
      email,
      logoUrl,
      timezone,
      deleted,
      version,
    );
  }

  updateProfile(
    name: string | undefined,
    address: string | null | undefined,
    phone: string | null | undefined,
    email: string | null | undefined,
    logoUrl: string | null | undefined,
    timezone: string | undefined,
  ): void {
    if (name !== undefined && name !== this._name.value) {
      this._name = Title.create(name);
    }
    if (address !== undefined) this._address = address?.trim() || null;
    if (phone !== undefined) this._phone = phone?.trim() || null;
    if (email !== undefined) {
      if (email !== null && !EmailLike.isValid(email)) {
        throw new BadRequestError('School email is not valid.');
      }
      this._email = email?.trim() || null;
    }
    if (logoUrl !== undefined) {
      if (logoUrl !== null && !UrlLike.isValid(logoUrl)) {
        throw new BadRequestError('School logo URL is not valid.');
      }
      this._logoUrl = logoUrl?.trim() || null;
    }
    if (timezone !== undefined && timezone !== this._timezone) {
      this._timezone = timezone;
    }
    this.raise(new SchoolProfileUpdatedEvent({ schoolId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This school has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new SchoolDeletedEvent({ schoolId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new SchoolRecoveredEvent({ schoolId: this._id }));
  }
}

/** Local minimal validators — keep the domain free of heavier VOs here. */
const EmailLike = {
  isValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
};

const UrlLike = {
  isValid(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },
};
