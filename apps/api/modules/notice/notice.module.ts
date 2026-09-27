import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { NoticeAppService } from './application/notice.app.service';
import { NoticeRepository } from './infra/notice.repository';
import { NoticeController } from './presentation/notice.controller';

/** Composition root (new.md §4): own repo + kernel buses; refs via QueryBus. */
export function createNoticeModule() {
  const noticeRepo = new NoticeRepository();
  const appSvc = new NoticeAppService(noticeRepo, eventBus, queryBus);
  const noticeController = new NoticeController(appSvc);

  return {
    noticeController,
    appSvc,
  };
}
