import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  NoticeAggregate,
  type NoticeReadModel,
  Quantity,
  Reason,
} from '@ecomerece/domain';
import type { NoticePersistence } from './notice.models';

export const NoticeMapper = {
  persistenceToAggregate(doc: NoticePersistence): NoticeAggregate {
    return NoticeAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      doc.title,
      doc.body,
      doc.audience,
      doc.classId ? Id.rehydrate(doc.classId) : null,
      Id.rehydrate(doc.publishedBy),
      doc.publishAt,
      doc.expiresAt ?? null,
      doc.attachments ?? [],
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(notice: NoticeAggregate) {
    return {
      _id: notice.id.value,
      schoolId: notice.schoolId.value,
      title: notice.title.value,
      body: notice.body,
      audience: notice.audience,
      classId: notice.classId?.value ?? null,
      publishedBy: notice.publishedBy.value,
      publishAt: notice.publishAt,
      expiresAt: notice.expiresAt,
      attachments: notice.attachments,
      deleted: {
        deleted: notice.deleted.isDeleted,
        at: notice.deleted.from?.value ?? null,
        by: notice.deleted.performedBy?.value ?? null,
        reason: notice.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(notice: NoticeAggregate): NoticeReadModel {
    return {
      id: notice.id.value,
      schoolId: notice.schoolId.value,
      title: notice.title.value,
      body: notice.body,
      audience: notice.audience,
      classId: notice.classId?.value ?? null,
      publishedBy: notice.publishedBy.value,
      publishAt: notice.publishAt,
      expiresAt: notice.expiresAt,
      attachments: notice.attachments,
      isDeleted: notice.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: NoticePersistence): NoticeReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      title: doc.title,
      body: doc.body,
      audience: doc.audience,
      classId: doc.classId ?? null,
      publishedBy: doc.publishedBy,
      publishAt: doc.publishAt,
      expiresAt: doc.expiresAt ?? null,
      attachments: doc.attachments ?? [],
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
