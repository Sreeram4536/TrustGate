import express from 'express';
import { KYCController } from '../controllers/implementation/KYCController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();
const kycController = new KYCController();

// User Routes
router.post('/upload', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res, next) => kycController.uploadKYC(req, res, next));
router.get('/status', authenticateToken, (req, res) => kycController.getKYCStatus(req, res));

// Admin Routes
router.patch('/approve/:userId', authenticateToken, requireAdmin, (req, res) => kycController.approveKYC(req, res));
router.patch('/reject/:userId', authenticateToken, requireAdmin, (req, res) => kycController.rejectKYC(req, res));

export default router;
