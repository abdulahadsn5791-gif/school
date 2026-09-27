import { GetClassRosterQuery } from '@ecomerece/domain';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ClassRepository } from '../class/infra/class.repository';
import { EnrollmentAppService } from './application/enrollment.app.service';
import { GetClassRosterHandler } from './application/query-handlers/get-class-roster.handler';
import { EnrollmentRepository } from './infra/enrollment.repository';
import { EnrollmentController } from './presentation/enrollment.controller';

/**
 * Composition root (new.md §4). The class repository is a core dependency
 * (enrollments derive schoolId/year from the class aggregate). School existence
 * and student name resolution go through the QueryBus.
 */
export function createEnrollmentModule() {
  const enrollmentRepo = new EnrollmentRepository();
  const classRepo = new ClassRepository();
  const appSvc = new EnrollmentAppService(enrollmentRepo, classRepo, eventBus, queryBus);
  const enrollmentController = new EnrollmentController(appSvc);

  queryBus.register(GetClassRosterQuery, new GetClassRosterHandler(appSvc));

  return {
    enrollmentController,
    appSvc,
  };
}
