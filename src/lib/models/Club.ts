import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClubDocument extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  coverImage?: string;
  department?: string;
  establishedYear: number;
  presidentName: string;
  presidentEmail: string;
  contactEmail: string;
  memberCount: number;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  status: 'active' | 'inactive';
}

const ClubSchema = new Schema<IClubDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    logo: { type: String, required: true },
    coverImage: { type: String },
    department: { type: String },
    establishedYear: { type: Number, default: 2020 },
    presidentName: { type: String, required: true },
    presidentEmail: { type: String, required: true },
    contactEmail: { type: String, required: true },
    memberCount: { type: Number, default: 0 },
    socialLinks: {
      facebook: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Club: Model<IClubDocument> =
  mongoose.models.Club || mongoose.model<IClubDocument>('Club', ClubSchema);
export default Club;
