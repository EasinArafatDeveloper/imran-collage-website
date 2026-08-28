import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmarkDocument extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmarkDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Bookmark: Model<IBookmarkDocument> =
  mongoose.models.Bookmark || mongoose.model<IBookmarkDocument>('Bookmark', BookmarkSchema);
export default Bookmark;
