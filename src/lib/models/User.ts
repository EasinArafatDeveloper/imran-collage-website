import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['student', 'admin'], 
      default: 'student' 
    },
    status: { 
      type: String, 
      enum: ['active', 'suspended', 'pending'], 
      default: 'active' 
    },
    avatar: { type: String },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> = 
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export default User;
