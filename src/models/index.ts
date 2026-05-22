/**
 * Central export file for all models
 * Giúp import nhiều models một lần: import { User, Customer, Pet } from '@/models'
 */

// Auth Models
export * from './auth';

// User Models (excluding User and UserRole which conflict with auth.ts)
export type { UpdateUserRequest, UserListResponse, UserSearchFilters } from './user';

// Customer Models
export * from './customer';

// Pet Models
export * from './pet';

// Appointment Models
export * from './appointment';

// Medical Record Models
export * from './medical-record';

// Notification Models
export * from './notification';
