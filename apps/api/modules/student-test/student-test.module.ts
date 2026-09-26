import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { AssignmentRepository } from '../assignment/infra/assignment.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { UserRepository } from '../user/infra/user.repository';
import { StudentTestAppService } from './application/student-test.app.service';
import { StudentTestRepository } from './infra/student-test.repository';
import { StudentTestController } from './presentation/student-test.controller';

export function createStudentTestModule() {
  const studentTestRepo = new StudentTestRepository();
  const appSvc = new StudentTestAppService(
    studentTestRepo,
    eventBus,
    new SchoolRepository(),
    new AssignmentRepository(),
    new UserRepository(),
  );
  const studentTestController = new StudentTestController(appSvc);

  return {
    studentTestController,
    appSvc,
  };
}
