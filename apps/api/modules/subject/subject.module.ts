import { GetSubjectsByIdsQuery } from '@ecomerece/domain';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { GetSubjectsByIdsHandler } from './application/query-handlers/get-subjects-by-ids.handler';
import { SubjectAppService } from './application/subject.app.service';
import { SubjectRepository } from './infra/subject.repository';
import { SubjectController } from './presentation/subject.controller';

/** Composition root (new.md §4): own repo + kernel buses; school via QueryBus. */
export function createSubjectModule() {
  const subjectRepo = new SubjectRepository();
  const appSvc = new SubjectAppService(subjectRepo, eventBus, queryBus);
  const subjectController = new SubjectController(appSvc);

  queryBus.register(GetSubjectsByIdsQuery, new GetSubjectsByIdsHandler(appSvc));

  return {
    subjectController,
    appSvc,
  };
}
