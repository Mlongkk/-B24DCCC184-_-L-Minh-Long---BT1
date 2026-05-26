import axios, { AxiosInstance } from 'axios';
import { Pet, CreatePetRequest, UpdatePetRequest, PetListResponse, PetSearchFilters, PetDependencies, DeletePetResponse } from '@/models/pet';
import authService from '@/services/auth/authService';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://ript1307-nhom-4-kthp-backend-production.up.railway.app/api';

// Helper to extract data from response (handles nested data field)
const extractData = (response: any) => {
    if (response?.data) return response.data;
    return response;
};

class PetService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/pets`,
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
     * Lấy chi tiết pet của user hiện tại (user thường)
     * GET /api/pets/my-pets/{petId}
     * @param petId
     */
    async getMyPetDetail(petId: string): Promise<any> {
        try {
            const response = await this.http.get(`/my-pets/${petId}`);
            // API trả về { success, data }
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Failed to fetch my pet detail', error);
            throw error;
        }
    }

    async getPets(filters?: PetSearchFilters): Promise<any> { // Để tạm any để tránh lỗi type
        try {
            const params: any = {
                ...filters,
            };
            // Chỉ map pageSize sang limit nếu filters được cung cấp
            if (filters && (filters as any).pageSize) {
                params.limit = (filters as any).pageSize;
            }
            const response = await this.http.get('/', { params });
            console.log('🚀 Gửi API với params:', params);

            // Trả về response.data (chứa { success, data, pagination })
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getMyPets(filters?: PetSearchFilters): Promise<any> {
        try {
            const params: any = {
                ...filters,
            };
            // Chỉ map pageSize sang limit nếu filters được cung cấp
            if (filters && (filters as any).pageSize) {
                params.limit = (filters as any).pageSize;
            }
            const response = await this.http.get('/my-pets', { params });
            console.log('🚀 Gửi API /my-pets với params:', params);

            // Trả về response.data (chứa { success, data, pagination })
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getPetById(id: string): Promise<Pet> {
        try {
            const response = await this.http.get(`/${id}`);
            const data = extractData(response.data);
            return data?.data || data;
        } catch (error) {
            console.error('Failed to fetch pet', error);
            throw error;
        }
    }

    async createPet(data: CreatePetRequest): Promise<Pet> {
        try {
            const response = await this.http.post('/', data);
            const responseData = extractData(response.data);
            return responseData?.data || responseData;
        } catch (error) {
            console.error('Failed to create pet', error);
            throw error;
        }
    }

    async updatePet(id: string, data: any): Promise<Pet> {
        try {
            // Convert frontend format to backend format
            const backendData: any = {};

            // Basic fields (with fallback to existing value handled by backend)
            if (data.name !== undefined) {
                backendData.name = data.name;
            }
            if (data.species !== undefined) {
                backendData.species = data.species;
            }
            if (data.breed !== undefined) {
                backendData.breed = data.breed;
            }
            if (data.gender !== undefined) {
                backendData.gender = data.gender;
            }

            // Convert dateOfBirth/birth_date to ISO format
            if (data.birth_date) {
                backendData.birth_date = data.birth_date;
            } else if (data.dateOfBirth) {
                backendData.birth_date = data.dateOfBirth;
            }

            // Handle weight - can be number or null
            if (data.weight !== undefined) {
                backendData.weight = data.weight ? parseFloat(data.weight) : null;
            }

            // Handle image upload (imageUrl from file upload, or image_url from existing)
            if (data.imageUrl !== undefined) {
                backendData.imageUrl = data.imageUrl;
            } else if (data.image_url !== undefined) {
                backendData.imageUrl = data.image_url;
            }

            console.log('📝 Updating pet:', id, 'with data:', backendData);
            const response = await this.http.put(`/${id}`, backendData);
            const responseData = extractData(response.data);
            return responseData?.data || responseData;
        } catch (error) {
            console.error('Failed to update pet', error);
            throw error;
        }
    }

    async deletePet(id: string): Promise<DeletePetResponse> {
        try {
            console.log('🗑️ Deleting pet:', id);
            const response = await this.http.delete(`/${id}`);
            console.log('✅ Delete pet success:', response.data);
            return extractData(response.data);
        } catch (error: any) {
            console.error('❌ Failed to delete pet');
            console.error('Pet ID:', id);
            console.error('Error Status:', error?.response?.status);
            console.error('Error Message:', error?.response?.data?.message);
            console.error('Error Data:', JSON.stringify(error?.response?.data, null, 2));
            console.error('Full Error:', error);
            throw error;
        }
    }

    async checkPetDependencies(id: string): Promise<PetDependencies> {
        try {
            console.log('🔍 Checking pet dependencies:', id);
            const response = await this.http.get(`/${id}/check-dependencies`);
            console.log('✅ Dependencies check success:', response.data);
            const data = extractData(response.data);
            return data?.data || data;
        } catch (error: any) {
            console.error('❌ Failed to check pet dependencies');
            console.error('Pet ID:', id);
            console.error('Error:', error);
            throw error;
        }
    }

    async getPetMedicalHistory(petId: string): Promise<any[]> {
        try {
            const response = await this.http.get(`/${petId}/medical-history`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pet medical history', error);
            throw error;
        }
    }

    async getPetAppointments(petId: string): Promise<any[]> {
        try {
            const response = await this.http.get(`/${petId}/appointments`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pet appointments', error);
            throw error;
        }
    }

    async uploadPetImage(petId: string, file: File): Promise<Pet> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await this.http.put(`/${petId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const responseData = extractData(response.data);
            return responseData?.data || responseData;
        } catch (error) {
            console.error('Failed to upload pet image', error);
            throw error;
        }
    }

    async uploadPetAvatar(petId: string, file: File): Promise<{ avatarUrl: string; image_url?: string }> {
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Backend uses PUT /api/pets/{id} for updating pet with image
            const response = await this.http.put(`/${petId}`, formData);
            const responseData = extractData(response.data);

            // Extract image_url from response
            const imageUrl = responseData?.data?.image_url || responseData?.image_url || '';
            return { avatarUrl: imageUrl, image_url: imageUrl };
        } catch (error: any) {
            console.error('Failed to upload pet avatar', error);
            console.error('Error status:', error?.response?.status);
            console.error('Error message:', error?.response?.data?.message);
            throw error;
        }
    }
}

export default new PetService();
