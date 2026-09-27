import { GetUserSummariesByIdsQuery, GetUserSummaryByIdQuery } from '@ecomerece/domain';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import {
  GetUserSummariesByIdsHandler,
  GetUserSummaryByIdHandler,
} from './application/query-handlers/user-summary.handlers';
import { UserAppService } from './application/user.app.service';
import { UserRepository } from './infra/user.repository';
import { UserController } from './presentation/user.controller';

let registered = false;

export function createUserModule() {
  const userRepo = new UserRepository();
  const appSvc = new UserAppService(userRepo, eventBus);
  const userController = new UserController(appSvc);

  // Cross-module summary queries (infra.md Step 1).
  if (!registered) {
    queryBus.register(GetUserSummaryByIdQuery, new GetUserSummaryByIdHandler(appSvc));
    queryBus.register(GetUserSummariesByIdsQuery, new GetUserSummariesByIdsHandler(appSvc));
    registered = true;
  }

  return {
    userController,
    appSvc,
  };
}
