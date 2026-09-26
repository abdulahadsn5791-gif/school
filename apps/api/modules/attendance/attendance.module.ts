import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { UserRepository } from '../user/infra/user.repository';
import { AttendanceAppService } from './application/attendance.app.service';
import { AttendanceRepository } from './infra/attendance.repository';
import { AttendanceController } from './presentation/attendance.controller';

export function createAttendanceModule() {
  const attendanceRepo = new AttendanceRepository();
  const appSvc = new AttendanceAppService(
    attendanceRepo,
    eventBus,
    new SchoolRepository(),
    new ClassRepository(),
    new UserRepository(),
  );
  const attendanceController = new AttendanceController(appSvc);

  return {
    attendanceController,
    appSvc,
  };
}
