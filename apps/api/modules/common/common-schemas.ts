import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// SHARED SUB-SCHEMAS (soft-delete / block / ban states, name, avatar, grading)
// ---------------------------------------------------------------------------

export const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    at: { type: Date, default: null },
    by: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

export const stateSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true, required: true },
    at: { type: Date, default: null },
    by: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

export const nameSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, default: null },
    lastName: { type: String, default: null },
    fullName: { type: String, required: true },
  },
  { _id: false },
);

export const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin', 'principal', 'staff'],
      default: 'student',
      required: true,
    },
    reason: { type: String, default: null },
    at: { type: Date, default: null },
    by: { type: String, default: null },
  },
  { _id: false },
);

export const avatarSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    uploadedAt: { type: Date, default: null },
  },
  { _id: false },
);

export const subjectGradeSchema = new mongoose.Schema(
  {
    subjectId: { type: String, ref: 'Subject', required: true },
    homeworkMarks: { type: Number, default: 0 },
    testMarks: { type: Number, default: 0 },
    oralMarks: { type: Number, default: 0 },
    totalObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    grade: { type: String, required: true },
    teacherRemarks: { type: String, default: null },
  },
  { _id: false },
);

export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type DayOfWeekType = (typeof DAYS_OF_WEEK)[number];
