import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryDocument extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  eventName?: string;
  eventDate?: Date;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGalleryDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String, required: true, trim: true },
    category: { type: String, default: 'Campus Life' },
    eventName: { type: String },
    eventDate: { type: Date, default: Date.now },
    uploadedBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

export const Gallery: Model<IGalleryDocument> =
  mongoose.models.Gallery || mongoose.model<IGalleryDocument>('Gallery', GallerySchema);

export default Gallery;
