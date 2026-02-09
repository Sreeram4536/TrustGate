import { IUserService } from '../interface/IUserService';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { UserMapper } from '../../mappers/UserMapper';
import { PaginatedUsersDTO } from '../../dtos/UserDTO';

export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async getUsers(page: number, limit: number, search: string): Promise<PaginatedUsersDTO> {
        const { users, total } = await this.userRepository.findAll(page, limit, search);
        const totalPages = Math.ceil(total / limit);

        console.log('Raw users from repository:', JSON.stringify(users[0], null, 2));
        const mappedUsers = UserMapper.toDTOList(users);
        console.log('Mapped users:', JSON.stringify(mappedUsers[0], null, 2));

        return {
            users: mappedUsers,
            total,
            page,
            totalPages
        };
    }
}
