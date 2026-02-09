import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenBlacklist extends Document {
    token: string;
    createdAt: Date;
}

const TokenBlacklistSchema: Schema = new Schema({
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' } // Auto remove after 7 days
});

export default mongoose.model<ITokenBlacklist>('TokenBlacklist', TokenBlacklistSchema);
