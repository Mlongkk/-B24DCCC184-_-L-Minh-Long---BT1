import axios, { AxiosInstance } from 'axios';
import {
    Customer,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerListResponse,
    CustomerSearchFilters,
} from '@/models/customer';
import authService from '@/services/auth/authService';

const API_BASE = 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

class CustomerService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: `${API_BASE}/customers`,
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
     * Get all customers
     */
    async getCustomers(filters?: CustomerSearchFilters): Promise<CustomerListResponse> {
        try {
            const response = await this.http.get('/', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customers', error);
            throw error;
        }
    }

    /**
     * Get customer by ID
     */
    async getCustomerById(id: string): Promise<Customer> {
        try {
            const response = await this.http.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customer', error);
            throw error;
        }
    }

    /**
     * Create new customer
     */
    async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
        try {
            const response = await this.http.post('/', data);
            return response.data;
        } catch (error) {
            console.error('Failed to create customer', error);
            throw error;
        }
    }

    /**
     * Update customer
     */
    async updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<Customer> {
        try {
            const response = await this.http.put(`/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update customer', error);
            throw error;
        }
    }

    /**
     * Delete customer
     */
    async deleteCustomer(id: string): Promise<void> {
        try {
            await this.http.delete(`/${id}`);
        } catch (error) {
            console.error('Failed to delete customer', error);
            throw error;
        }
    }

    /**
     * Search customers
     */
    async searchCustomers(query: string): Promise<Customer[]> {
        try {
            const response = await this.http.get('/search', {
                params: { q: query },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search customers', error);
            throw error;
        }
    }

    /**
     * Get customer's pets
     */
    async getCustomerPets(customerId: string): Promise<any[]> {
        try {
            const response = await this.http.get(`/${customerId}/pets`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customer pets', error);
            throw error;
        }
    }

    /**
     * Get customer's appointments
     */
    async getCustomerAppointments(customerId: string): Promise<any[]> {
        try {
            const response = await this.http.get(`/${customerId}/appointments`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customer appointments', error);
            throw error;
        }
    }
}

export default new CustomerService();
