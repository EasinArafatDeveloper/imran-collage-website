import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificateDocument extends Document {
  certificateNumber: string;
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  userId: mongoose.Types.ObjectId;
  studentName: string;
  studentId: string;
  department: string;
  issueDate: Date;
  organizerName: string;
  qrVerificationUrl: string;
}

const CertificateSchema = new Schema<ICertificateDocument>(
  {
    certificateNumber: { type: String, required: true, unique: true, uppercase: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    department: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    organizerName: { type: String, required: true },
    qrVerificationUrl: { type: String, required: true },
  },
  { timestamps: true }
);

CertificateSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Certificate: Model<ICertificateDocument> =
  mongoose.models.Certificate || mongoose.model<ICertificateDocument>('Certificate', CertificateSchema);
export default Certificate;
