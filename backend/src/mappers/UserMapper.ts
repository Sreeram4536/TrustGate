import { IUser } from '../models/User';
import { UserDTO } from '../dtos/UserDTO';

export class UserMapper {
    static toDTO(user: any): UserDTO {
        return {
            id: (user._id as unknown) as string,
            email: user.email,
            role: user.role || 'user',
            joinedAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
            kycStatus: user.kycStatus || 'not_submitted',
            kycImage: user.kycImage,
            kycVideo: user.kycVideo,
        };
    }

    static toDTOList(users: any[]): UserDTO[] {
        return users.map(user => this.toDTO(user));
    }
}
