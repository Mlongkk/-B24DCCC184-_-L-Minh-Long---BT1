import axios, { AxiosInstance } from 'axios';
import {
    MedicalRecord,
    CreateMedicalRecordRequest,
    UpdateMedicalRecordRequest,
    MedicalRecordListResponse,
    MedicalTimeline,
} from '@/models/medical-record';
import authService from '@/services/auth/authService';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

class MedicalRecordService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/medical-records`,
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

    async getMedicalRecords(filters?: any): Promise<MedicalRecordListResponse> {
        try {
            const response = await this.http.get('/', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch medical records', error);
            throw error;
        }
    }

    async getMedicalRecordById(id: string): Promise<MedicalRecord> {
        try {
            const response = await this.http.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch medical record', error);
            throw error;
        }
    }

    async createMedicalRecord(data: CreateMedicalRecordRequest): Promise<MedicalRecord> {
        try {
            const requestData = {
                pet_id: data.petId,
                visit_date: data.visitDate,
                diagnosis: data.diagnosis,
                treatment: data.treatment,
                notes: data.notes,
            };
            const response = await this.http.post('/', requestData);
            return response.data;
        } catch (error) {
            console.error('Failed to create medical record', error);
            throw error;
        }
    }

    async updateMedicalRecord(
        id: string,
        data: Partial<CreateMedicalRecordRequest>,
    ): Promise<MedicalRecord> {
        try {
            const requestData: any = {};
            if (data.diagnosis) requestData.diagnosis = data.diagnosis;
            if (data.treatment) requestData.treatment = data.treatment;
            if (data.notes) requestData.notes = data.notes;
            const response = await this.http.put(`/${id}`, requestData);
            return response.data;
        } catch (error) {
            console.error('Failed to update medical record', error);
            throw error;
        }
    }

    async deleteMedicalRecord(id: string): Promise<void> {
        try {
            await this.http.delete(`/${id}`);
        } catch (error) {
            console.error('Failed to delete medical record', error);
            throw error;
        }
    }

    /**
         * Get medical timeline for a pet
         * Swagger: GET /api/medical-records/pet/{pet_id}/history
         */
    async getMedicalTimeline(petId: string): Promise<any> {
        try {
            const response = await this.http.get(`/pet/${petId}/history`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch medical timeline', error);
            throw error;
        }
    }

    /**
     * Get records by pet ID
     * Swagger: GET /api/medical-records?pet_id={pet_id}
     */
    async getRecordsByPetId(petId: string): Promise<MedicalRecord[]> {
        try {
            const response = await this.http.get('/', { params: { pet_id: petId } });

            // Đảm bảo bọc dữ liệu an toàn phòng trường hợp backend trả về phân trang { data: [...] } hoặc mảng trực tiếp
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch pet medical records', error);
            throw error;
        }
    }

    /**
     * Upload attachment to medical record
     */
    async uploadAttachment(recordId: string, file: File): Promise<{ attachmentId: string; fileUrl: string }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await this.http.post(`/${recordId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to upload attachment', error);
            throw error;
        }
    }

    /**
     * Download medical record as PDF
     */
    async downloadAsPDF(recordId: string): Promise<Blob> {
        try {
            const response = await this.http.get(`/${recordId}/export/pdf`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Failed to download PDF', error);
            throw error;
        }
    }
}

export default new MedicalRecordService();
