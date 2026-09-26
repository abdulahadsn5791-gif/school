import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { NoticeCreatedEvent } from './events/notice-created.event';
import { NoticeDeletedEvent } from './events/notice-deleted.event';
import { NoticeRecoveredEvent } from './events/notice-recovered.event';
import { NoticeUpdatedEvent } from './events/notice-updated.event';

export type NoticeAudience = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS';

const AUDIENCES: NoticeAudience[] = ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS'];

type CreateNoticeProps = {
  id: Id;
  schoolId: Id;
  title: string;
  body: string;
  audience: NoticeAudience;
  classId: Id | null;
  publishedBy: Id;
  publishAt: Date;
  expiresAt: Date | null;
  attachments: string[];
};

export class NoticeAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _title: Title,
    private _body: string,
    private _audience: NoticeAudience,
    private _classId: Id | null,
    private readonly _publishedBy: Id,
    private _publishAt: Date,
    private _expiresAt: Date | null,
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

  get body() {
    return this._body;
  }

  get audience() {
    return this._audience;
  }

  get classId() {
    return this._classId;
  }

  get publishedBy() {
    return this._publishedBy;
  }

  get publishAt() {
    return this._publishAt;
  }

  get expiresAt() {
    return this._expiresAt;
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

  static create(props: CreateNoticeProps): NoticeAggregate {
    if (!AUDIENCES.includes(props.audience)) {
      throw new BadRequestError('Notice audience is not supported.');
    }
    if (props.audience === 'CLASS' && props.classId === null) {
      throw new BadRequestError('A class must be selected when the audience is CLASS.');
    }
    if (props.audience !== 'CLASS' && props.classId !== null) {
      throw new BadRequestError('classId is only allowed when the audience is CLASS.');
    }
    if (props.expiresAt && props.expiresAt.getTime() <= props.publishAt.getTime()) {
      throw new BadRequestError('Notice expiry must be after its publish time.');
    }

    const notice = new NoticeAggregate(
      props.id,
      props.schoolId,
      Title.create(props.title),
      props.body.trim(),
      props.audience,
      props.classId,
      props.publishedBy,
      props.publishAt,
      props.expiresAt,
      [...props.attachments],
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    notice.raise(new NoticeCreatedEvent({ noticeId: notice._id, schoolId: props.schoolId }));
    return notice;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    title: string,
    body: string,
    audience: NoticeAudience,
    classId: Id | null,
    publishedBy: Id,
    publishAt: Date,
    expiresAt: Date | null,
    attachments: string[],
    deleted: DeleteInfoVO,
    version: Quantity,
  ): NoticeAggregate {
    return new NoticeAggregate(
      id,
      schoolId,
      Title.rehydrate(title),
      body,
      audience,
      classId,
      publishedBy,
      publishAt,
      expiresAt,
      [...attachments],
      deleted,
      version,
    );
  }

  update(
    title: string | undefined,
    body: string | undefined,
    audience: NoticeAudience | undefined,
    classId: Id | null | undefined,
    expiresAt: Date | null | undefined,
    attachments: string[] | undefined,
  ): void {
    const nextAudience = audience ?? this._audience;
    const nextClassId = classId === undefined ? this._classId : classId;
    if (nextAudience === 'CLASS' && nextClassId === null) {
      throw new BadRequestError('A class must be selected when the audience is CLASS.');
    }
    if (nextAudience !== 'CLASS' && nextClassId !== null) {
      throw new BadRequestError('classId is only allowed when the audience is CLASS.');
    }

    if (title !== undefined && title !== this._title.value) this._title = Title.create(title);
    if (body !== undefined) this._body = body.trim();
    this._audience = nextAudience;
    this._classId = nextClassId;
    if (expiresAt !== undefined) {
      if (expiresAt && expiresAt.getTime() <= this._publishAt.getTime()) {
        throw new BadRequestError('Notice expiry must be after its publish time.');
      }
      this._expiresAt = expiresAt;
    }
    if (attachments !== undefined) this._attachments = [...attachments];
    this.raise(new NoticeUpdatedEvent({ noticeId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This notice has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new NoticeDeletedEvent({ noticeId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new NoticeRecoveredEvent({ noticeId: this._id }));
  }
}
