import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { AssignmentRepository } from '../assignment/infra/assignment.repository';
import { StudentTestAppService } from './application/student-test.app.service';
import { StudentTestRepository } from './infra/student-test.repository';
import { StudentTestController } from './presentation/student-test.controller';

/**
 * Composition root (new.md §4). School/student existence checks go through the
 * QueryBus. The assignment repository stays for grader ownership checks, which
 * need the assignment aggregate (teacherId, totalMarks ceiling).
 */
export function createStudentTestModule() {
  const studentTestRepo = new StudentTestRepository();
  const appSvc = new StudentTestAppService(
    studentTestRepo,
    eventBus,
    queryBus,
    new AssignmentRepository(),
  );
  const studentTestController = new StudentTestController(appSvc);

  return {
    studentTestController,
    appSvc,
  };
}
