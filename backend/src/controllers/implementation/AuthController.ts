import { Request, Response } from 'express';
import { IAuthController } from '../interface/IAuthController';
import { IAuthService } from '../../services/interface/IAuthService';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../constants/messages';

export class AuthController implements IAuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const user = await this.authService.register(email, password);
            res.status(HTTP_STATUS.CREATED).json({ message: MESSAGES.USER_CREATED, userId: user._id });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, user } = await this.authService.login(email, password);
            res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, role: user.role } });
        } catch (error: any) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.REFRESH_TOKEN_REQUIRED });
                return;
            }
            const tokens = await this.authService.refreshToken(refreshToken);
            res.json(tokens);
        } catch (error: any) {
            res.status(HTTP_STATUS.FORBIDDEN).json({ error: error.message });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) await this.authService.logout(refreshToken);
            res.json({ message: MESSAGES.LOGGED_OUT });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}
