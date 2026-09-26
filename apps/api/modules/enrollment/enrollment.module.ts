import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { EnrollmentAppService } from './application/enrollment.app.service';
import { EnrollmentRepository } from './infra/enrollment.repository';
import { EnrollmentController } from './presentation/enrollment.controller';

export function createEnrollmentModule() {
  const enrollmentRepo = new EnrollmentRepository();
  const classRepo = new ClassRepository();
  const appSvc = new EnrollmentAppService(enrollmentRepo, classRepo, eventBus);
  const enrollmentController = new EnrollmentController(appSvc);

  return {
    enrollmentController,
    appSvc,
  };
}
