import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { DAYS_OF_WEEK, deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 6. TIMETABLE
// ---------------------------------------------------------------------------

const timetableSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    academicYear: { type: String, required: true },
    classId: { type: String, ref: 'Class', required: true },
    subjectId: { type: String, ref: 'Subject', required: true },
    teacherId: { type: String, ref: 'User', required: true },
    periodId: { type: String, ref: 'Period', required: true },
    dayOfWeek: { type: String, enum: DAYS_OF_WEEK, required: true },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

// a class cannot have two teachers/subjects at the same slot, per year
timetableSchema.index(
  { schoolId: 1, classId: 1, academicYear: 1, dayOfWeek: 1, periodId: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);
// a teacher cannot teach two classes at the same slot, per year
timetableSchema.index(
  { schoolId: 1, teacherId: 1, academicYear: 1, dayOfWeek: 1, periodId: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type TimetablePersistence = InferSchemaType<typeof timetableSchema>;
export type TimetableDocument = HydratedDocument<TimetablePersistence>;
export const TimetableModel = mongoose.model<TimetablePersistence>('Timetable', timetableSchema);
