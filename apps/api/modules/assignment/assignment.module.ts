import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { AssignmentAppService } from './application/assignment.app.service';
import { AssignmentRepository } from './infra/assignment.repository';
import { AssignmentController } from './presentation/assignment.controller';

/**
 * Composition root (new.md §4). Cross-module existence checks go through the
 * QueryBus. The class repository is the one deliberate exception: teacher
 * self-service ownership checks need the class aggregate (classTeacherId),
 * which the summary read model deliberately does not expose.
 */
export function createAssignmentModule() {
  const assignmentRepo = new AssignmentRepository();
  const appSvc = new AssignmentAppService(
    assignmentRepo,
    eventBus,
    queryBus,
    new ClassRepository(),
  );
  const assignmentController = new AssignmentController(appSvc);

  return {
    assignmentController,
    appSvc,
  };
}
