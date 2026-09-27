import {
  GetClassSummaryByIdQuery,
  GetSchoolSummaryByIdQuery,
  GetUserSummaryByIdQuery,
  type IAcademicTermRepository,
  Id,
  type IEventBus,
  type IQueryBus,
  type IReportRepository,
  Reason,
  ReportAggregate,
  type ReportReadModel,
  type SubjectGrade,
} from '@ecomerece/domain';
import type {
  CreateReportType,
  DeleteReportType,
  GetReportsType,
  UpdateReportType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { ReportMapper } from '../infra/report.mapper';
import { ReportMessages } from '../presentation/report.messages';

export class ReportAppService {
  constructor(
    private readonly reportRepo: IReportRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
    private readonly termRepo?: IAcademicTermRepository,
  ) {}

  private async publishEvents(report: ReportAggregate): Promise<void> {
    const events = report.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  /**
   * Referential existence via the QueryBus (infra.md Step 1); the term check
   * uses the academic-term repository because reports need the term record.
   */
  private async assertRefsExist(
    schoolId: Id,
    classId: Id,
    termId: Id,
    studentId: Id,
  ): Promise<void> {
    const [school, clazz, student] = await Promise.all([
      this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value)),
      this.queryBus.execute(new GetClassSummaryByIdQuery(classId.value)),
      this.queryBus.execute(new GetUserSummaryByIdQuery(studentId.value)),
    ]);
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    if (student.isDeleted) throw new ConflictError('This student is not available.');
    if (this.termRepo) {
      await this.termRepo.FindByIdOrThrow(termId);
    }
  }

  private toSubjectGrades(
    subjects: CreateReportType['subjects'] | NonNullable<UpdateReportType['subjects']>,
  ): SubjectGrade[] {
    return subjects.map((s) => ({
      subjectId: s.subjectId,
      homeworkMarks: s.homeworkMarks,
      testMarks: s.testMarks,
      oralMarks: s.oralMarks,
      totalObtained: s.totalObtained,
      maxMarks: s.maxMarks,
      grade: s.grade,
      teacherRemarks: s.teacherRemarks ?? null,
    }));
  }

  async createReport(data: CreateReportType, actor: Actor): Promise<ReportReadModel> {
    actor.assertRoleIn('admin', 'teacher');

    const schoolId = Id.create(data.schoolId);
    const classId = Id.create(data.classId);
    const termId = Id.create(data.termId);
    const studentId = Id.create(data.studentId);

    await this.assertRefsExist(schoolId, classId, termId, studentId);

    // One live report per student+term (schema partial unique index).
    const existing = await this.reportRepo.FindByStudentAndTerm(studentId, termId);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('A report already exists for this student and term.');
    }

    const report = ReportAggregate.create({
      id: Id.create(),
      schoolId,
      studentId,
      classId,
      termId,
      academicYear: data.academicYear,
      subjects: this.toSubjectGrades(data.subjects),
      overallPercentage: data.overallPercentage,
      overallGrade: data.overallGrade,
      attendancePercentage: data.attendancePercentage ?? null,
      generalRemarks: data.generalRemarks ?? null,
      generatedBy: actor.id,
    });

    await this.reportRepo.Create(report);
    await this.publishEvents(report);
    return ReportMapper.aggregateToReadModel(report);
  }

  async updateReport(data: UpdateReportType, actor: Actor): Promise<ReportReadModel> {
    actor.assertRoleIn('admin', 'teacher');

    const report = await this.reportRepo.FindByIdOrThrow(Id.create(data.reportId));
    if (report.isDeleted) throw new NotFoundError('Report not found.');

    report.update(
      data.subjects ? this.toSubjectGrades(data.subjects) : undefined,
      data.overallPercentage,
      data.overallGrade,
      data.attendancePercentage,
      data.generalRemarks,
    );

    await this.reportRepo.Save(report);
    await this.publishEvents(report);
    return ReportMapper.aggregateToReadModel(report);
  }

  async getReport(reportId: string): Promise<ReportReadModel> {
    const report = await this.reportRepo.FindByIdOrThrow(Id.create(reportId));
    return ReportMapper.aggregateToReadModel(report);
  }

  async listReports(query: GetReportsType): Promise<{
    data: ReportReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.studentId) filter.studentId = query.studentId;
    if (query.classId) filter.classId = query.classId;
    if (query.termId) filter.termId = query.termId;
    if (query.academicYear) filter.academicYear = query.academicYear;

    const result = await this.reportRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((report) => ReportMapper.aggregateToReadModel(report)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteReportType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const reportId = Id.create(data.reportId);
    const report = await this.reportRepo.FindByIdOrThrow(reportId);
    report.delete(actorId, Reason.create(data.reason));
    await this.reportRepo.Save(report);
    await this.publishEvents(report);
    return ReportMessages.delete(reportId, actorId).message;
  }
}
