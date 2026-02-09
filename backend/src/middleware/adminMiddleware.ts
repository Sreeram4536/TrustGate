import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
        return;
    }

    next();
};
