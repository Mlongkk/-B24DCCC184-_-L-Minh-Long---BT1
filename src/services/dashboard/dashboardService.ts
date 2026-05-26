import axios, { AxiosInstance } from 'axios';
import authService from '@/services/auth/authService';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

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
    // New API fields
    appointments?: {
        byStatus: Array<{ status: string; _count: number }>;
        byPriority: Array<{ priority_level: string; _count: number }>;
    };
    pets?: {
        topSpecies: Array<{ species: string; _count: number }>;
    };
    summary?: {
        totalUsers: number;
        totalPets: number;
        totalAppointments: number;
        totalMedicalRecords: number;
        totalDoctors: number;
        totalCustomers: number;
    };
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
            baseURL: `${API_BASE}/statistics`,
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
            const response = await this.http.get('/dashboard');
            // Handle both old and new API response formats
            const data = response.data?.data || response.data;
            return {
                ...data,
                // Keep backward compatibility with old format
                totalCustomers: data.summary?.totalCustomers || data.totalCustomers || 0,
                totalPets: data.summary?.totalPets || data.totalPets || 0,
                totalAppointments: data.summary?.totalAppointments || data.totalAppointments || 0,
                completedAppointments: data.appointments?.byStatus?.find((item: any) => item.status === 'COMPLETED')?._count || 0,
                pendingAppointments: data.appointments?.byStatus?.find((item: any) => item.status === 'SCHEDULED')?._count || 0,
                upcomingAppointments: data.summary?.totalAppointments || 0,
                activeVeterinarians: data.summary?.totalDoctors || 0,
            };
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            // Sử dụng dữ liệu mô phỏng tạm thời khi API chưa sẵn sàng
            console.warn('Using mock data for dashboard');
            return this.getMockStats();
        }
    }

    /**
     * Dữ liệu mô phỏng cho dashboard (tạm thời)
     */
    private getMockStats(): DashboardStats {
        return {
            totalCustomers: 24,
            totalPets: 36,
            totalAppointments: 156,
            completedAppointments: 128,
            pendingAppointments: 12,
            upcomingAppointments: 16,
            activeVeterinarians: 5,
            appointmentsByMonth: [
                { month: 'Jan', count: 120 },
                { month: 'Feb', count: 150 },
                { month: 'Mar', count: 180 },
                { month: 'Apr', count: 200 },
                { month: 'May', count: 156 },
            ],
            petSpeciesDistribution: [
                { species: 'Chó', count: 18 },
                { species: 'Mèo', count: 12 },
                { species: 'Chim', count: 4 },
                { species: 'Khác', count: 2 },
            ],
            appointmentStatusDistribution: [
                { status: 'Pending', count: 12 },
                { status: 'Confirmed', count: 44 },
                { status: 'Completed', count: 100 },
            ],
        };
    }

    /**
     * Get chart data for dashboard
     */
    async getChartData(): Promise<ChartData> {
        try {
            const response = await this.http.get('/appointments');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch chart data', error);
            throw error;
        }
    }

    /**
     * Get appointment trends
     */
    async getAppointmentTrends(startDate?: string, endDate?: string): Promise<any[]> {
        try {
            const response = await this.http.get('/appointments', {
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
            // Lưu ý: Backend chưa có endpoint này, sử dụng mock data tạm thời
            console.warn('Customer growth endpoint not yet implemented, using mock data');
            return [
                { month: 'Jan', count: 10 },
                { month: 'Feb', count: 12 },
                { month: 'Mar', count: 18 },
                { month: 'Apr', count: 24 },
                { month: 'May', count: 24 },
            ];
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customer growth data', error);
            throw error;
        }
    }

    /**
     * Get revenue data
     */
    async getRevenueData(startDate?: string, endDate?: string): Promise<any> {
        try {
            const response = await this.http.get('/revenue', {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch revenue data', error);
            // Trả về mock data khi API lỗi
            return { totalRevenue: 15000000, currency: 'VND' };
        }
    }

    /**
     * Get pet health statistics
     */
    async getPetHealthStats(): Promise<any> {
        try {
            const response = await this.http.get('/pet-health');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pet health stats', error);
            throw error;
        }
    }

    /**
     * Get doctor performance statistics
     */
    async getDoctorStats(doctorId: string): Promise<any> {
        try {
            const response = await this.http.get(`/doctor/${doctorId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch doctor stats', error);
            throw error;
        }
    }
}

export default new DashboardService();
