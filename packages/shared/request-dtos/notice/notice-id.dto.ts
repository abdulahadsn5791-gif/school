import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const noticeIdDto = z.object({
  noticeId: idSchema,
});

export type NoticeIdType = z.infer<typeof noticeIdDto>;

export const deleteNoticeDto = z.object({
  noticeId: idSchema,
  reason: reasonSchema,
});

export type DeleteNoticeType = z.infer<typeof deleteNoticeDto>;
