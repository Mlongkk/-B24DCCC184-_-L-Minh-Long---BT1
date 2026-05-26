import axios, { AxiosInstance } from 'axios';
import {
    Appointment,
    CreateAppointmentRequest,
    UpdateAppointmentRequest,
    AppointmentListResponse,
    AppointmentSearchFilters,
    DaySchedule,
} from '@/models/appointment';
import authService from '@/services/auth/authService';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

class AppointmentService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/appointments`,
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

    async getAppointments(filters?: AppointmentSearchFilters): Promise<AppointmentListResponse> {
        try {
            const response = await this.http.get('/', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch appointments', error);
            throw error;
        }
    }

    async getAppointmentById(id: string): Promise<Appointment> {
        try {
            const response = await this.http.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch appointment', error);
            throw error;
        }
    }

    async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
        try {
            const response = await this.http.post('/', data);
            return response.data;
        } catch (error) {
            console.error('Failed to create appointment', error);
            throw error;
        }
    }

    async updateAppointment(
        id: string,
        data: Partial<UpdateAppointmentRequest>
    ): Promise<Appointment> {
        const response = await this.http.put(`/${id}`, data);
        return response.data;
    }

    async deleteAppointment(id: string): Promise<void> {
        try {
            await this.http.delete(`/${id}`);
        } catch (error) {
            console.error('Failed to delete appointment', error);
            throw error;
        }
    }

    /**
     * Cancel appointment
     */
    async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
        try {
            const response = await this.http.patch(`/${id}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error('Failed to cancel appointment', error);
            throw error;
        }
    }

    /**
     * Get available time slots for a date
     */
    async getAvailableSlots(date: string, veterinarianId?: string): Promise<DaySchedule> {
        try {
            const response = await this.http.get('/availability/slots', {
                params: {
                    date,
                    doctor_id: veterinarianId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch available slots', error);
            throw error;
        }
    }

    /**
     * Get available dates
     */
    async getAvailableDates(startDate: string, endDate: string): Promise<string[]> {
        try {
            const response = await this.http.get('/availability/dates', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch available dates', error);
            throw error;
        }
    }

    /**
     * Send appointment reminder
     */
    async sendReminder(appointmentId: string): Promise<void> {
        try {
            await this.http.post(`/${appointmentId}/send-reminder`);
        } catch (error) {
            console.error('Failed to send reminder', error);
            throw error;
        }
    }

    /**
     * Confirm appointment
     */
    async confirmAppointment(id: string): Promise<Appointment> {
        try {
            const response = await this.http.patch(`/${id}/confirm`, { status: 'CONFIRMED' });
            return response.data;
        } catch (error) {
            console.error('Failed to confirm appointment', error);
            throw error;
        }
    }

    /**
     * Complete appointment (mark as completed)
     */
    async completeAppointment(id: string): Promise<Appointment> {
        try {
            const response = await this.http.patch(`/${id}/complete`, { status: 'COMPLETED' });
            return response.data;
        } catch (error) {
            console.error('Failed to complete appointment', error);
            throw error;
        }
    }

    /**
     * Get doctor's appointment schedule
     * Swagger: GET /api/doctor/{doctor_id}/schedule
     */
    async getDoctorSchedule(doctorId: string, filters?: any): Promise<any> {
        try {
            const response = await this.http.get(`/doctor/${doctorId}/schedule`, {
                params: filters,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch doctor schedule', error);
            throw error;
        }
    }

    /**
     * Get current user's appointments
     * GET /api/appointments/my-appointments?status=CONFIRMED&priority_level=URGENT&page=1&limit=10
     */
    async getMyAppointments(filters?: any): Promise<AppointmentListResponse> {
        try {
            const response = await this.http.get('/my-appointments', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch my appointments', error);
            throw error;
        }
    }
}

export default new AppointmentService();
