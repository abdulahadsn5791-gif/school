import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { LeaveAppService } from './application/leave.app.service';
import { LeaveRepository } from './infra/leave.repository';
import { LeaveController } from './presentation/leave.controller';

/** Composition root (new.md §4): own repo + kernel buses; refs via QueryBus. */
export function createLeaveModule() {
  const leaveRepo = new LeaveRepository();
  const appSvc = new LeaveAppService(leaveRepo, eventBus, queryBus);
  const leaveController = new LeaveController(appSvc);

  return {
    leaveController,
    appSvc,
  };
}
