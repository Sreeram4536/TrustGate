import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import KYC, { IKYC } from '../../models/KYC';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary again or import from config
// Ideally import from ../../config/cloudinary, but direct import here is fine if config was run at startup
// But better to ensure config is loaded.

// Ensure cloudinary is configured
import '../../config/cloudinary';

export class KYCController {

    // Upload both Image and Video
    async uploadKYC(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const existingKYC = await KYC.findOne({ user: user.id });
            if (existingKYC && existingKYC.status === 'approved') {
                res.status(400).json({ message: 'KYC already approved' });
                return;
            }
            if (existingKYC && existingKYC.status === 'pending') {
                // Maybe allow overwrite if pending? Or block? let's block for now to keep it simple or update.
                // Let's allow overwrite for now by deleting old one or just updating.
                // Actually, let's just update the fields.
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files || !files['image'] || !files['video']) {
                res.status(400).json({ message: 'Both image and video are required' });
                return;
            }

            const imageFile = files['image'][0];
            const videoFile = files['video'][0];

            // Upload Image to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'kyc_images',
                resource_type: 'image'
            });

            // Upload Video to Cloudinary
            const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
                folder: 'kyc_videos',
                resource_type: 'video'
            });

            // Clean up local files
            fs.unlinkSync(imageFile.path);
            fs.unlinkSync(videoFile.path);

            if (existingKYC) {
                existingKYC.imageUrl = imageUpload.secure_url;
                existingKYC.videoUrl = videoUpload.secure_url;
                existingKYC.status = 'pending'; // Reset status if re-uploading
                await existingKYC.save();
                res.status(200).json({ message: 'KYC updated successfully', kyc: existingKYC });
            } else {
                const newKYC = new KYC({
                    user: user.id,
                    imageUrl: imageUpload.secure_url,
                    videoUrl: videoUpload.secure_url,
                    status: 'pending'
                });
                await newKYC.save();
                res.status(201).json({ message: 'KYC submitted successfully', kyc: newKYC });
            }

        } catch (error: any) {
            console.error('KYC Upload Error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                cloudinaryError: error.error
            });

            // Cleanup files if they exist and error occurred
            try {
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                if (files?.['image']?.[0]?.path && fs.existsSync(files['image'][0].path)) {
                    fs.unlinkSync(files['image'][0].path);
                }
                if (files?.['video']?.[0]?.path && fs.existsSync(files['video'][0].path)) {
                    fs.unlinkSync(files['video'][0].path);
                }
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }

            res.status(500).json({
                message: 'Internal server error during KYC upload',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get KYC Status
    async getKYCStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const kyc = await KYC.findOne({ user: req.user.id });
            if (!kyc) {
                res.status(404).json({ message: 'KYC not found' });
                return;
            }
            res.json(kyc);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching KYC status' });
        }
    }

    // Admin: Approve KYC
    async approveKYC(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const kyc = await KYC.findOneAndUpdate(
                { user: userId },
                { status: 'approved' },
                { new: true }
            );

            if (!kyc) {
                res.status(404).json({ message: 'KYC not found for this user' });
                return;
            }

            res.status(200).json({ message: 'KYC approved successfully', kyc });
        } catch (error) {
            res.status(500).json({ message: 'Error approving KYC' });
        }
    }

    // Admin: Reject KYC
    async rejectKYC(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const kyc = await KYC.findOneAndUpdate(
                { user: userId },
                { status: 'rejected' },
                { new: true }
            );

            if (!kyc) {
                res.status(404).json({ message: 'KYC not found for this user' });
                return;
            }

            res.status(200).json({ message: 'KYC rejected successfully', kyc });
        } catch (error) {
            res.status(500).json({ message: 'Error rejecting KYC' });
        }
    }
}
