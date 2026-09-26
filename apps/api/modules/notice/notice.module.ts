import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { NoticeAppService } from './application/notice.app.service';
import { NoticeRepository } from './infra/notice.repository';
import { NoticeController } from './presentation/notice.controller';

export function createNoticeModule() {
  const noticeRepo = new NoticeRepository();
  const schoolRepo = new SchoolRepository();
  const classRepo = new ClassRepository();
  const appSvc = new NoticeAppService(noticeRepo, eventBus, schoolRepo, classRepo);
  const noticeController = new NoticeController(appSvc);

  return {
    noticeController,
    appSvc,
  };
}
