import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 7. ATTENDANCE
// ---------------------------------------------------------------------------

const attendanceSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    studentId: { type: String, ref: 'User', required: true },
    classId: { type: String, ref: 'Class', required: true },
    subjectId: { type: String, ref: 'Subject', default: null },
    periodId: { type: String, ref: 'Period', default: null },
    date: { type: Date, required: true }, // normalized to UTC midnight
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      required: true,
      default: 'PRESENT',
    },
    remark: { type: String, default: null },
    markedBy: { type: String, ref: 'User', required: true },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

attendanceSchema.index(
  { schoolId: 1, studentId: 1, classId: 1, date: 1, periodId: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);
attendanceSchema.index({ schoolId: 1, classId: 1, date: 1 });

export type AttendancePersistence = InferSchemaType<typeof attendanceSchema>;
export type AttendanceDocument = HydratedDocument<AttendancePersistence>;
export const AttendanceModel = mongoose.model<AttendancePersistence>(
  'Attendance',
  attendanceSchema,
);
