import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventDocument extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  category: string;
  organizerId: mongoose.Types.ObjectId;
  organizerName: string;
  organizerEmail: string;
  organizerRole?: string;
  clubId?: mongoose.Types.ObjectId;
  clubName?: string;
  department?: string;
  eventType: 'offline' | 'online' | 'hybrid';
  venue: string;
  building?: string;
  room?: string;
  mapUrl?: string;
  startAt: Date;
  endAt: Date;
  registrationDeadline: Date;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  isWaitlistEnabled: boolean;
  registrationFee: number;
  isFeeRequired: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published' | 'cancelled' | 'completed';
  rejectionReason?: string;
  speakers: Array<{
    name: string;
    designation: string;
    organization: string;
    photo?: string;
    bio?: string;
  }>;
  agenda: Array<{
    time: string;
    title: string;
    description?: string;
    speaker?: string;
  }>;
  requirements: string[];
  rules: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpeakerSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    organization: { type: String, required: true },
    photo: { type: String },
    bio: { type: String },
  },
  { _id: false }
);

const AgendaSchema = new Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    speaker: { type: String },
  },
  { _id: false }
);

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const EventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: { type: String, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizerName: { type: String, required: true },
    organizerEmail: { type: String, required: true },
    organizerRole: { type: String, default: 'Club Organizer' },
    clubId: { type: Schema.Types.ObjectId, ref: 'Club' },
    clubName: { type: String },
    department: { type: String },
    eventType: { type: String, enum: ['offline', 'online', 'hybrid'], default: 'offline' },
    venue: { type: String, required: true },
    building: { type: String },
    room: { type: String },
    mapUrl: { type: String },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0 },
    waitlistCount: { type: Number, default: 0 },
    isWaitlistEnabled: { type: Boolean, default: true },
    registrationFee: { type: Number, default: 0 },
    isFeeRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    rejectionReason: { type: String },
    speakers: [SpeakerSchema],
    agenda: [AgendaSchema],
    requirements: [{ type: String }],
    rules: [{ type: String }],
    faq: [FaqSchema],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for fast searching and discovery
EventSchema.index({ status: 1, startAt: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ title: 'text', description: 'text', department: 'text' });

export const Event: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema);
export default Event;
