import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { SessionAppService } from './application/session.app.service';
import { SessionRepository } from './infra/session.repository';
import { SessionController } from './presentation/session.controller';

export function createSessionModule() {
  const sessionRepo = new SessionRepository();
  const appSvc = new SessionAppService(sessionRepo, eventBus);
  const sessionController = new SessionController(appSvc);

  return {
    sessionController,
    appSvc,
  };
}
