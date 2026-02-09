import { Request, Response } from 'express';
import { IUserController } from '../interface/IUserController';
import { IUserService } from '../../services/interface/IUserService';
import { HTTP_STATUS } from '../../constants/httpStatus';

export class UserController implements IUserController {
    private userService: IUserService;

    constructor(userService: IUserService) {
        this.userService = userService;
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || '';

            const result = await this.userService.getUsers(page, limit, search);
            res.status(HTTP_STATUS.OK).json(result);
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}
