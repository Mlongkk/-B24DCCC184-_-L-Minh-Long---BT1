/**
 * User Models
 * Định nghĩa các kiểu dữ liệu cho người dùng
 */

export enum UserRole {
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    CUSTOMER = 'CUSTOMER',
}

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    roles: UserRole[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface UserListResponse {
    data: User[];
    total: number;
    page: number;
    pageSize: number;
}

export interface UpdateUserRequest {
    email?: string;
    fullName?: string;
    phone?: string;
    roles?: UserRole[];
    avatar?: string;
}

export interface UserSearchFilters {
    search?: string;
    role?: UserRole;
    page?: number;
    pageSize?: number;
}
