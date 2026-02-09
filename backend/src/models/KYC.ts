import mongoose, { Schema, Document } from 'mongoose';

export interface IKYC extends Document {
    user: mongoose.Types.ObjectId;
    imageUrl: string;
    videoUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const KYCMongooseSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IKYC>('KYC', KYCMongooseSchema);
