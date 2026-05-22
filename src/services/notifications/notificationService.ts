import axios, { AxiosInstance } from 'axios';
import {
    Notification,
    NotificationListResponse,
    NotificationFilter,
    NotificationPreferences,
} from '@/models/notification';
import authService from '@/services/auth/authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class NotificationService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/notifications`,
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

    async getNotifications(filter?: NotificationFilter): Promise<NotificationListResponse> {
        try {
            const response = await this.http.get('/', { params: filter });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            throw error;
        }
    }

    async getNotificationById(id: string): Promise<Notification> {
        try {
            const response = await this.http.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notification', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string): Promise<Notification> {
        try {
            const response = await this.http.patch(`/${id}/read`);
            return response.data;
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        try {
            await this.http.patch('/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
            throw error;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(id: string): Promise<void> {
        try {
            await this.http.delete(`/${id}`);
        } catch (error) {
            console.error('Failed to delete notification', error);
            throw error;
        }
    }

    /**
     * Get unread count
     */
    async getUnreadCount(): Promise<{ count: number }> {
        try {
            const response = await this.http.get('/unread/count');
            return response.data;
        } catch (error) {
            console.error('Failed to get unread count', error);
            throw error;
        }
    }

    /**
     * Get user notification preferences
     */
    async getPreferences(): Promise<NotificationPreferences> {
        try {
            const response = await this.http.get('/preferences');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notification preferences', error);
            throw error;
        }
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
        try {
            const response = await this.http.put('/preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Failed to update notification preferences', error);
            throw error;
        }
    }

    /**
     * Get appointment reminders
     */
    async getAppointmentReminders(): Promise<Notification[]> {
        try {
            const response = await this.http.get('/appointment-reminders');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch appointment reminders', error);
            throw error;
        }
    }
}

export default new NotificationService();
