import axios, { AxiosInstance } from 'axios';
import {
    User,
    UpdateUserRequest,
    UserListResponse,
    UserSearchFilters,
} from '@/models/user';
import authService from '@/services/auth/authService';

const API_BASE = 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

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
     * Get all users (Admin only)
     */
    async getUsers(filters?: UserSearchFilters): Promise<UserListResponse> {
        try {
            const response = await this.http.get('/', { params: filters });
            return response.data;
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
            return response.data;
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
            const response = await this.http.put(`/${id}`, data);
            return response.data;
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
}

export default new UserService();
