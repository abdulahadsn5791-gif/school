import {
  DeleteInfoVO,
  EffectiveDate,
  Id,
  Quantity,
  Reason,
  ReportAggregate,
  type ReportReadModel,
} from '@ecomerece/domain';
import type { ReportPersistence } from './report.models';

export const ReportMapper = {
  persistenceToAggregate(doc: ReportPersistence): ReportAggregate {
    return ReportAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.schoolId),
      Id.rehydrate(doc.studentId),
      Id.rehydrate(doc.classId),
      Id.rehydrate(doc.termId),
      doc.academicYear,
      (doc.subjects ?? []).map((s) => ({
        subjectId: s.subjectId,
        homeworkMarks: s.homeworkMarks,
        testMarks: s.testMarks,
        oralMarks: s.oralMarks,
        totalObtained: s.totalObtained,
        maxMarks: s.maxMarks,
        grade: s.grade,
        teacherRemarks: s.teacherRemarks ?? null,
      })),
      doc.overallPercentage,
      doc.overallGrade,
      doc.attendancePercentage ?? null,
      doc.generalRemarks ?? null,
      Id.rehydrate(doc.generatedBy),
      DeleteInfoVO.rehydrate(
        doc.deleted.by ? Id.rehydrate(doc.deleted.by) : null,
        doc.deleted.deleted,
        doc.deleted.at ? EffectiveDate.rehydrate(doc.deleted.at) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(0),
    );
  },

  aggregateToPersistence(report: ReportAggregate) {
    return {
      _id: report.id.value,
      schoolId: report.schoolId.value,
      studentId: report.studentId.value,
      classId: report.classId.value,
      termId: report.termId.value,
      academicYear: report.academicYear,
      subjects: report.subjects,
      overallPercentage: report.overallPercentage,
      overallGrade: report.overallGrade,
      attendancePercentage: report.attendancePercentage,
      generalRemarks: report.generalRemarks,
      generatedBy: report.generatedBy.value,
      deleted: {
        deleted: report.deleted.isDeleted,
        at: report.deleted.from?.value ?? null,
        by: report.deleted.performedBy?.value ?? null,
        reason: report.deleted.reason?.value ?? null,
      },
    };
  },

  aggregateToReadModel(report: ReportAggregate): ReportReadModel {
    return {
      id: report.id.value,
      schoolId: report.schoolId.value,
      studentId: report.studentId.value,
      classId: report.classId.value,
      termId: report.termId.value,
      academicYear: report.academicYear,
      subjects: report.subjects,
      overallPercentage: report.overallPercentage,
      overallGrade: report.overallGrade,
      attendancePercentage: report.attendancePercentage,
      generalRemarks: report.generalRemarks,
      generatedBy: report.generatedBy.value,
      isDeleted: report.isDeleted,
      createdAt: new Date(),
    };
  },

  persistenceToReadModel(doc: ReportPersistence): ReportReadModel {
    return {
      id: doc._id,
      schoolId: doc.schoolId,
      studentId: doc.studentId,
      classId: doc.classId,
      termId: doc.termId,
      academicYear: doc.academicYear,
      subjects: (doc.subjects ?? []).map((s) => ({
        subjectId: s.subjectId,
        homeworkMarks: s.homeworkMarks,
        testMarks: s.testMarks,
        oralMarks: s.oralMarks,
        totalObtained: s.totalObtained,
        maxMarks: s.maxMarks,
        grade: s.grade,
        teacherRemarks: s.teacherRemarks ?? null,
      })),
      overallPercentage: doc.overallPercentage,
      overallGrade: doc.overallGrade,
      attendancePercentage: doc.attendancePercentage ?? null,
      generalRemarks: doc.generalRemarks ?? null,
      generatedBy: doc.generatedBy,
      isDeleted: doc.deleted.deleted,
      createdAt: doc.createdAt,
    };
  },
};
