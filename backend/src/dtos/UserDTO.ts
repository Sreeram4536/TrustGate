export interface UserDTO {
    id: string;
    email: string;
    role: string;
    joinedAt: string;
    kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
    kycImage?: string;
    kycVideo?: string;
}

export interface PaginatedUsersDTO {
    users: UserDTO[];
    total: number;
    page: number;
    totalPages: number;
}
