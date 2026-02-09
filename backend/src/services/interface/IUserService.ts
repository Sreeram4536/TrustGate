import { PaginatedUsersDTO } from '../../dtos/UserDTO';

export interface IUserService {
    getUsers(page: number, limit: number, search: string): Promise<PaginatedUsersDTO>;
}
