import type {
  ClassSummaryReadModel,
  GetClassSummaryByIdQuery,
  GetPeriodSummaryByIdQuery,
  GetSchoolSummaryByIdQuery,
  GetSubjectSummaryByIdQuery,
  PeriodSummaryReadModel,
  SchoolSummaryReadModel,
  SubjectSummaryReadModel,
} from '@ecomerece/domain';
import type { ClassAppService } from '../../../class/application/class.app.service';
import type { PeriodAppService } from '../../../period/application/period.app.service';
import type { SubjectAppService } from '../../../subject/application/subject.app.service';
import type { SchoolAppService } from '../school.app.service';

/**
 * Thin adapters over the owning module's app services (infra.md Step 1).
 * Cross-module QueryBus reads always run at PUBLIC tier, so hidden rows
 * (deleted) surface as a thrown NotFoundError — existence is not leaked.
 */
export class GetSchoolSummaryByIdHandler {
  constructor(private readonly schoolAppService: SchoolAppService) {}

  async handle(query: GetSchoolSummaryByIdQuery): Promise<SchoolSummaryReadModel> {
    const school = await this.schoolAppService.getSchool(query.id);
    return { id: school.id, name: school.name, isDeleted: false };
  }
}

export class GetClassSummaryByIdHandler {
  constructor(private readonly classAppService: ClassAppService) {}

  async handle(query: GetClassSummaryByIdQuery): Promise<ClassSummaryReadModel> {
    const clazz = await this.classAppService.getClass(query.id);
    return {
      id: clazz.id,
      schoolId: clazz.schoolId,
      academicYear: clazz.academicYear,
      isDeleted: false,
    };
  }
}

export class GetSubjectSummaryByIdHandler {
  constructor(private readonly subjectAppService: SubjectAppService) {}

  async handle(query: GetSubjectSummaryByIdQuery): Promise<SubjectSummaryReadModel> {
    const subject = await this.subjectAppService.getSubject(query.id);
    return { id: subject.id, schoolId: subject.schoolId, isDeleted: false };
  }
}

export class GetPeriodSummaryByIdHandler {
  constructor(private readonly periodAppService: PeriodAppService) {}

  async handle(query: GetPeriodSummaryByIdQuery): Promise<PeriodSummaryReadModel> {
    const period = await this.periodAppService.getPeriod(query.id);
    return { id: period.id, schoolId: period.schoolId, isDeleted: false };
  }
}
