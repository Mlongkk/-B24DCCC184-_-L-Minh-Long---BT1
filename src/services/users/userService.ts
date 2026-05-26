import axios, { AxiosInstance } from 'axios';
import {
    User,
    UpdateUserRequest,
    CreateUserRequest,
    UserListResponse,
    UserSearchFilters,
} from '@/models/user';
import authService from '@/services/auth/authService';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

class UserService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/users`,
            timeout: 10000,
        });

        this.http.interceptors.request.use((config) => {
            const token = authService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Transform API response to match frontend model
     */
    private transformUser(user: any): any {
        return {
            ...user,
            fullName: user.fullName || user.full_name || '',
            phone: user.phone || user.phoneNumber || '',
        };
    }

    /**
     * Get all users (Admin only)
     */
    async getUsers(filters?: UserSearchFilters): Promise<UserListResponse> {
        try {
            const response = await this.http.get('/', { params: filters });
            const data = response.data;

            // Transform users array
            if (data.data && Array.isArray(data.data)) {
                data.data = data.data.map((user: any) => this.transformUser(user));
            }

            return data;
        } catch (error) {
            console.error('Failed to fetch users', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User> {
        try {
            const response = await this.http.get(`/${id}`);
            return this.transformUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            throw error;
        }
    }

    /**
     * Update user
     */
    async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
        try {
            // Handle roles: if it's an array, take first element; if it's a string, use it as-is
            let roleValue = '';
            if (Array.isArray(data.roles) && data.roles.length > 0) {
                roleValue = data.roles[0];
            } else if (typeof data.roles === 'string') {
                roleValue = data.roles;
            }

            // Map VET to DOCTOR for backend compatibility
            if (roleValue === 'VET') {
                roleValue = 'DOCTOR';
            }

            const payload: any = {};

            // Include fields if they're provided
            if (data.username) {
                payload.username = data.username;
            }
            if (data.fullName) {
                payload.full_name = data.fullName;
            }
            if (data.phone) {
                payload.phone = data.phone;
            }
            if (roleValue) {
                payload.role = roleValue;
            }

            console.log('Sending to backend:', payload);
            console.log('Role value:', roleValue, 'Type:', typeof roleValue);

            const response = await this.http.put(`/${id}`, payload);

            console.log('Response from backend:', response.data);

            return this.transformUser(response.data);
        } catch (error) {
            console.error('Failed to update user', error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async deleteUser(id: string): Promise<void> {
        try {
            await this.http.delete(`/${id}`);
        } catch (error) {
            console.error('Failed to delete user', error);
            throw error;
        }
    }

    /**
     * Create new user (Public registration endpoint)
     */
    async createUser(data: CreateUserRequest): Promise<User> {
        try {
            // Create axios instance for auth endpoint
            const authHttp = axios.create({
                baseURL: `${API_BASE}/auth`,
                timeout: 10000,
            });

            const response = await authHttp.post('/register', data);
            return this.transformUser(response.data?.data || response.data);
        } catch (error) {
            console.error('Failed to create user', error);
            throw error;
        }
    }
}

export default new UserService();
