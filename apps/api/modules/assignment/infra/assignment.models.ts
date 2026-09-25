import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 8. ASSIGNMENT
// ---------------------------------------------------------------------------

const assignmentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    type: { type: String, enum: ['homework', 'test', 'oral'], required: true },
    classId: { type: String, ref: 'Class', required: true },
    subjectId: { type: String, ref: 'Subject', required: true },
    teacherId: { type: String, ref: 'User', required: true },
    assignedDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
    attachments: [{ type: String }],
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

assignmentSchema.index({ schoolId: 1, classId: 1, assignedDate: 1 });
assignmentSchema.index({ schoolId: 1, teacherId: 1, subjectId: 1 });

export type AssignmentPersistence = InferSchemaType<typeof assignmentSchema>;
export type AssignmentDocument = HydratedDocument<AssignmentPersistence>;
export const AssignmentModel = mongoose.model<AssignmentPersistence>(
  'Assignment',
  assignmentSchema,
);
