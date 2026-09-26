import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { LeaveAppService } from './application/leave.app.service';
import { LeaveRepository } from './infra/leave.repository';
import { LeaveController } from './presentation/leave.controller';

export function createLeaveModule() {
  const leaveRepo = new LeaveRepository();
  const schoolRepo = new SchoolRepository();
  const classRepo = new ClassRepository();
  const appSvc = new LeaveAppService(leaveRepo, eventBus, schoolRepo, classRepo);
  const leaveController = new LeaveController(appSvc);

  return {
    leaveController,
    appSvc,
  };
}
