import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { UserRepository } from '../user/infra/user.repository';
import { EnrollmentAppService } from './application/enrollment.app.service';
import { EnrollmentRepository } from './infra/enrollment.repository';
import { EnrollmentController } from './presentation/enrollment.controller';

export function createEnrollmentModule() {
  const enrollmentRepo = new EnrollmentRepository();
  const classRepo = new ClassRepository();
  const schoolRepo = new SchoolRepository();
  const appSvc = new EnrollmentAppService(
    enrollmentRepo,
    classRepo,
    eventBus,
    schoolRepo,
    new UserRepository(),
  );
  const enrollmentController = new EnrollmentController(appSvc);

  return {
    enrollmentController,
    appSvc,
  };
}
