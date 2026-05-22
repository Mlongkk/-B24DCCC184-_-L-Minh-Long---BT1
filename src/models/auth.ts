/** Auth & User Types */

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatar?: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
}

export interface LoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isActive: boolean;
}

export interface Permission {
    id: string;
    code: string;
    name: string;
    description: string;
    resource: string;
    action: string;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
    VET = 'VET',
    RECEPTIONIST = 'RECEPTIONIST',
    CUSTOMER = 'CUSTOMER',
}

export enum Permission_Codes {
    // User Management
    USER_VIEW = 'user:view',
    USER_CREATE = 'user:create',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',

    // Customer Management
    CUSTOMER_VIEW = 'customer:view',
    CUSTOMER_CREATE = 'customer:create',
    CUSTOMER_UPDATE = 'customer:update',
    CUSTOMER_DELETE = 'customer:delete',

    // Pet Management
    PET_VIEW = 'pet:view',
    PET_CREATE = 'pet:create',
    PET_UPDATE = 'pet:update',
    PET_DELETE = 'pet:delete',

    // Appointment Management
    APPOINTMENT_VIEW = 'appointment:view',
    APPOINTMENT_CREATE = 'appointment:create',
    APPOINTMENT_UPDATE = 'appointment:update',
    APPOINTMENT_DELETE = 'appointment:delete',

    // Medical Records
    MEDICAL_VIEW = 'medical:view',
    MEDICAL_CREATE = 'medical:create',
    MEDICAL_UPDATE = 'medical:update',
    MEDICAL_DELETE = 'medical:delete',

    // Dashboard & Reports
    DASHBOARD_VIEW = 'dashboard:view',
    REPORTS_VIEW = 'reports:view',
}
