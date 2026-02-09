import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService } from '../interface/IAuthService';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import TokenBlacklist from '../../models/TokenBlacklist';
import { IUser } from '../../models/User';
import { MESSAGES } from '../../constants/messages';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService implements IAuthService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async register(email: string, password: string): Promise<IUser> {
        const existingUser = await this.userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error(MESSAGES.USER_EXISTS);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        return await this.userRepository.createUser(email, passwordHash);
    }

    async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: IUser }> {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error(MESSAGES.INVALID_CREDENTIALS);
        }

        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            throw new Error(MESSAGES.INVALID_CREDENTIALS);
        }

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { accessToken, refreshToken, user };
    }

    async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
        const isBlacklisted = await TokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            throw new Error(MESSAGES.TOKEN_BLACKLISTED);
        }

        try {
            const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as any;
            const user = await this.userRepository.findUserById(decoded.id);

            if (!user) {
                throw new Error(MESSAGES.USER_NOT_FOUND);
            }

            // Rotate tokens
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            // Invalidate old refresh token
            await this.blacklistToken(token);

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new Error(MESSAGES.INVALID_REFRESH_TOKEN);
        }
    }

    async logout(token: string): Promise<void> {
        await this.blacklistToken(token);
    }

    private generateAccessToken(user: IUser): string {
        return jwt.sign({ id: user._id, email: user.email, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    }

    private generateRefreshToken(user: IUser): string {
        return jwt.sign({ id: user._id, email: user.email, role: user.role }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    }

    private async blacklistToken(token: string) {
        await TokenBlacklist.create({ token });
    }
}
