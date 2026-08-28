import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudentProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  semester: string;
  academicYear: string;
  phone: string;
  bio?: string;
  emergencyContact?: string;
  avatar?: string;
}

const StudentProfileSchema = new Schema<IStudentProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    faculty: { type: String, required: true },
    department: { type: String, required: true },
    program: { type: String, default: 'B.Sc. in Computer Science & Engineering' },
    semester: { type: String, default: 'Spring 2026' },
    academicYear: { type: String, default: '3rd Year' },
    phone: { type: String, required: true },
    bio: { type: String },
    emergencyContact: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const StudentProfile: Model<IStudentProfileDocument> =
  mongoose.models.StudentProfile || mongoose.model<IStudentProfileDocument>('StudentProfile', StudentProfileSchema);
export default StudentProfile;
