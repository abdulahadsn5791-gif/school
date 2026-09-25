import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { EnrollmentRepository } from '../enrollment/infra/enrollment.repository';
import { UserAppService } from './application/user.app.service';
import { UserRepository } from './infra/user.repository';
import { UserController } from './presentation/user.controller';

export function createUserModule() {
  const userRepo = new UserRepository();
  const enrollmentRepo = new EnrollmentRepository();
  const appSvc = new UserAppService(userRepo, eventBus, enrollmentRepo);
  const userController = new UserController(appSvc);

  return {
    userController,
    appSvc,
  };
}
