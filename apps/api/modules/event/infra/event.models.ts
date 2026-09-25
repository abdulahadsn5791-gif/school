import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 14. EVENT / CALENDAR
// ---------------------------------------------------------------------------

const eventSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    type: {
      type: String,
      enum: ['HOLIDAY', 'EXAM', 'MEETING', 'ACTIVITY', 'OTHER'],
      required: true,
      default: 'OTHER',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    classId: { type: String, ref: 'Class', default: null }, // null = whole school
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

eventSchema.index({ schoolId: 1, startDate: 1 });

export type CalendarEventPersistence = InferSchemaType<typeof eventSchema>;
export type CalendarEventDocument = HydratedDocument<CalendarEventPersistence>;
export const CalendarEventModel = mongoose.model<CalendarEventPersistence>(
  'CalendarEvent',
  eventSchema,
);
