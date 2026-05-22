import axios, { AxiosInstance } from 'axios';
import { Pet, CreatePetRequest, UpdatePetRequest, PetListResponse, PetSearchFilters } from '@/models/pet';
import authService from '@/services/auth/authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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

    async getPets(filters?: PetSearchFilters): Promise<PetListResponse> {
        try {
            const response = await this.http.get('/', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pets', error);
            throw error;
        }
    }

    async getPetById(id: string): Promise<Pet> {
        try {
            const response = await this.http.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pet', error);
            throw error;
        }
    }

    async createPet(data: CreatePetRequest): Promise<Pet> {
        try {
            const response = await this.http.post('/', data);
            return response.data;
        } catch (error) {
            console.error('Failed to create pet', error);
            throw error;
        }
    }

    async updatePet(id: string, data: Partial<CreatePetRequest>): Promise<Pet> {
        try {
            const response = await this.http.put(`/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update pet', error);
            throw error;
        }
    }

    async deletePet(id: string): Promise<void> {
        try {
            await this.http.delete(`/${id}`);
        } catch (error) {
            console.error('Failed to delete pet', error);
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

    async uploadPetAvatar(petId: string, file: File): Promise<{ avatarUrl: string }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await this.http.post(`/${petId}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to upload pet avatar', error);
            throw error;
        }
    }
}

export default new PetService();
