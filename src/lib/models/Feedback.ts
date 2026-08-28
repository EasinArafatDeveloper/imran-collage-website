import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedbackDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  studentId: string;
  rating: number;
  organizationRating: number;
  speakerRating: number;
  venueRating: number;
  comment: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    studentId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    organizationRating: { type: Number, default: 5, min: 1, max: 5 },
    speakerRating: { type: Number, default: 5, min: 1, max: 5 },
    venueRating: { type: Number, default: 5, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

FeedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Feedback: Model<IFeedbackDocument> =
  mongoose.models.Feedback || mongoose.model<IFeedbackDocument>('Feedback', FeedbackSchema);
export default Feedback;
