import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventRegistrationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  eventStartAt: Date;
  eventVenue: string;
  eventCoverImage?: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  studentId: string;
  department: string;
  phone: string;
  registrationCode: string;
  qrPayloadToken: string;
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show';
  paymentStatus: 'free' | 'paid' | 'pending';
  paymentMethod?: string;
  trxId?: string;
  amountPaid: number;
  tshirtSize?: string;
  foodPreference?: string;
  registeredAt: Date;
  cancelledAt?: Date;
  attendedAt?: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistrationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    eventStartAt: { type: Date, required: true },
    eventVenue: { type: String, required: true },
    eventCoverImage: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    studentId: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, required: true },
    registrationCode: { type: String, required: true, unique: true },
    qrPayloadToken: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['registered', 'waitlisted', 'cancelled', 'attended', 'no_show'],
      default: 'registered',
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'paid', 'pending'],
      default: 'free',
    },
    paymentMethod: { type: String },
    trxId: { type: String },
    amountPaid: { type: Number, default: 0 },
    tshirtSize: { type: String, default: 'L' },
    foodPreference: { type: String, default: 'Standard' },
    registeredAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    attendedAt: { type: Date },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventRegistration: Model<IEventRegistrationDocument> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistrationDocument>('EventRegistration', EventRegistrationSchema);
export default EventRegistration;
