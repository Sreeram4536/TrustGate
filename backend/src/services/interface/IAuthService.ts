import { IUser } from '../../models/User';

export interface IAuthService {
    register(email: string, password: string): Promise<IUser>;
    login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
    refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }>;
    logout(token: string): Promise<void>;
}
