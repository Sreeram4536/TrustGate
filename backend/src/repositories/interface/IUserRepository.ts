import { IUser } from '../../models/User';

export interface IUserRepository {
    createUser(email: string, passwordHash: string): Promise<IUser>;
    findUserByEmail(email: string): Promise<IUser | null>;
    findUserById(id: string): Promise<IUser | null>;
    findAll(page: number, limit: number, search: string): Promise<{ users: IUser[]; total: number }>;
}
