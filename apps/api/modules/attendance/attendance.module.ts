import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { AttendanceAppService } from './application/attendance.app.service';
import { AttendanceRepository } from './infra/attendance.repository';
import { AttendanceController } from './presentation/attendance.controller';

/**
 * Composition root (new.md §4). Cross-module existence checks (school, student)
 * go through the QueryBus. The class repository stays for teacher self-service
 * ownership checks, which need the class aggregate's classTeacherId.
 */
export function createAttendanceModule() {
  const attendanceRepo = new AttendanceRepository();
  const appSvc = new AttendanceAppService(
    attendanceRepo,
    eventBus,
    queryBus,
    new ClassRepository(),
  );
  const attendanceController = new AttendanceController(appSvc);

  return {
    attendanceController,
    appSvc,
  };
}
