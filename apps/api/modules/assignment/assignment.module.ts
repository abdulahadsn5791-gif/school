import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { SchoolRepository } from '../school/infra/school.repository';
import { SubjectRepository } from '../subject/infra/subject.repository';
import { UserRepository } from '../user/infra/user.repository';
import { AssignmentAppService } from './application/assignment.app.service';
import { AssignmentRepository } from './infra/assignment.repository';
import { AssignmentController } from './presentation/assignment.controller';

export function createAssignmentModule() {
  const assignmentRepo = new AssignmentRepository();
  const appSvc = new AssignmentAppService(
    assignmentRepo,
    eventBus,
    new SchoolRepository(),
    new ClassRepository(),
    new SubjectRepository(),
    new UserRepository(),
  );
  const assignmentController = new AssignmentController(appSvc);

  return {
    assignmentController,
    appSvc,
  };
}
