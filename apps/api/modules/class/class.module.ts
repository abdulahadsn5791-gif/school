import { GetClassesByIdsQuery } from '@ecomerece/domain';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ClassAppService } from './application/class.app.service';
import { GetClassesByIdsHandler } from './application/query-handlers/get-classes-by-ids.handler';
import { ClassRepository } from './infra/class.repository';
import { ClassController } from './presentation/class.controller';

/** Composition root (new.md §4): own repo + kernel buses; school via QueryBus. */
export function createClassModule() {
  const classRepo = new ClassRepository();
  const appSvc = new ClassAppService(classRepo, eventBus, queryBus);
  const classController = new ClassController(appSvc);

  queryBus.register(GetClassesByIdsQuery, new GetClassesByIdsHandler(appSvc));

  return {
    classController,
    appSvc,
  };
}
