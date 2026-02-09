import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import TokenBlacklist from '../models/TokenBlacklist';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        res.sendStatus(401);
        return;
    }

    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
        res.sendStatus(403);
        return;
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        req.user = user;
        next();
    });
};
