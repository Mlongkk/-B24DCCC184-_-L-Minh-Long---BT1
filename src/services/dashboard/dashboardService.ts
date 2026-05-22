import axios, { AxiosInstance } from 'axios';
import authService from '@/services/auth/authService';

const API_BASE = 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

export interface DashboardStats {
    totalCustomers: number;
    totalPets: number;
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
    pendingAppointments: number;
    activeVeterinarians: number;
    appointmentsByMonth: Array<{ month: string; count: number }>;
    petSpeciesDistribution: Array<{ species: string; count: number }>;
    appointmentStatusDistribution: Array<{ status: string; count: number }>;
}

export interface ChartData {
    appointmentTrend: Array<{ date: string; count: number }>;
    customerGrowth: Array<{ month: string; count: number }>;
    petSpecies: Array<{ name: string; value: number }>;
    appointmentStatus: Array<{ name: string; value: number }>;
    veterinarianPerformance: Array<{ name: string; appointmentCount: number; rating: number }>;
}

class DashboardService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/dashboard`,
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
     * Get dashboard statistics
     */
    async getStats(): Promise<DashboardStats> {
        try {
            const response = await this.http.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            throw error;
        }
    }

    /**
     * Get chart data for dashboard
     */
    async getChartData(): Promise<ChartData> {
        try {
            const response = await this.http.get('/charts');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch chart data', error);
            throw error;
        }
    }

    /**
     * Get appointment trends
     */
    async getAppointmentTrends(startDate: string, endDate: string): Promise<any[]> {
        try {
            const response = await this.http.get('/trends/appointments', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch appointment trends', error);
            throw error;
        }
    }

    /**
     * Get customer growth data
     */
    async getCustomerGrowth(months: number = 12): Promise<any[]> {
        try {
            const response = await this.http.get('/trends/customers', {
                params: { months },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customer growth data', error);
            throw error;
        }
    }

    /**
     * Get revenue data
     */
    async getRevenueData(startDate: string, endDate: string): Promise<any> {
        try {
            const response = await this.http.get('/revenue', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch revenue data', error);
            throw error;
        }
    }
}

export default new DashboardService();
