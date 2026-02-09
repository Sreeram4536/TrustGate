import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);

