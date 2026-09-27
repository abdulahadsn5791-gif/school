import {
  GetClassSummaryByIdQuery,
  GetPeriodSummaryByIdQuery,
  GetSchoolByCodeQuery,
  GetSchoolSummaryByIdQuery,
  GetSubjectSummaryByIdQuery,
} from '@ecomerece/domain';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ClassAppService } from '../class/application/class.app.service';
import { ClassRepository } from '../class/infra/class.repository';
import { PeriodAppService } from '../period/application/period.app.service';
import { PeriodRepository } from '../period/infra/period.repository';
import { SubjectAppService } from '../subject/application/subject.app.service';
import { SubjectRepository } from '../subject/infra/subject.repository';
import {
  GetClassSummaryByIdHandler,
  GetPeriodSummaryByIdHandler,
  GetSchoolSummaryByIdHandler,
  GetSubjectSummaryByIdHandler,
} from './application/query-handlers/entity-summary.handlers';
import { GetSchoolByCodeHandler } from './application/query-handlers/get-school-by-code.handler';
import { SchoolAppService } from './application/school.app.service';
import { SchoolRepository } from './infra/school.repository';
import { SchoolController } from './presentation/school.controller';

let registered = false;

export function createSchoolModule() {
  const schoolRepo = new SchoolRepository();
  const appSvc = new SchoolAppService(schoolRepo, eventBus);
  const schoolController = new SchoolController(appSvc);

  // Cross-module summary queries (infra.md Step 1). The school module is the
  // natural composition point for the four school-scoped reference entities.
  if (!registered) {
    queryBus.register(GetSchoolSummaryByIdQuery, new GetSchoolSummaryByIdHandler(appSvc));
    queryBus.register(GetSchoolByCodeQuery, new GetSchoolByCodeHandler(appSvc));
    queryBus.register(
      GetClassSummaryByIdQuery,
      new GetClassSummaryByIdHandler(
        new ClassAppService(new ClassRepository(), eventBus, queryBus),
      ),
    );
    queryBus.register(
      GetSubjectSummaryByIdQuery,
      new GetSubjectSummaryByIdHandler(
        new SubjectAppService(new SubjectRepository(), eventBus, queryBus),
      ),
    );
    queryBus.register(
      GetPeriodSummaryByIdQuery,
      new GetPeriodSummaryByIdHandler(
        new PeriodAppService(new PeriodRepository(), eventBus, queryBus),
      ),
    );
    registered = true;
  }

  return {
    schoolController,
    appSvc,
  };
}
