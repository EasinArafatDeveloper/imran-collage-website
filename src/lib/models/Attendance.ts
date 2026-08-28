import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentId: string;
  studentName: string;
  department: string;
  checkedInAt: Date;
  checkedInBy: string;
  verificationMethod: 'qr_scan' | 'manual';
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'EventRegistration', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    department: { type: String, required: true },
    checkedInAt: { type: Date, default: Date.now },
    checkedInBy: { type: String, required: true },
    verificationMethod: { type: String, enum: ['qr_scan', 'manual'], default: 'qr_scan' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ eventId: 1, registrationId: 1 }, { unique: true });
AttendanceSchema.index({ eventId: 1, studentId: 1 });

export const Attendance: Model<IAttendanceDocument> =
  mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);
export default Attendance;
