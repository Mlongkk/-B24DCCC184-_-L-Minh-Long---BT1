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
    data: UserProfile[];
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