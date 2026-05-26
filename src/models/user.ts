/**
 * User Models
 * Định nghĩa các kiểu dữ liệu cho người dùng
 * Note: User và UserRole được import từ models/auth.ts để tránh xung đột
 */

import { User, UserRole } from './auth';

// Re-export for convenience
export type { User };
export { UserRole };

// Extended User interface for user management views with additional fields
export interface UserProfile extends User {
    phone?: string;
}

export interface UserListResponse {
    success?: boolean;
    data: UserProfile[];
    pagination?: {
        total: number;
        page: number;
        limit?: number;
        pageSize?: number;
        totalPages?: number;
    };
    total?: number;
    page?: number;
    limit?: number;
    pageSize?: number;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    full_name: string;
    phone?: string;
}

export interface UpdateUserRequest {
    username?: string;
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
    limit?: number;
}