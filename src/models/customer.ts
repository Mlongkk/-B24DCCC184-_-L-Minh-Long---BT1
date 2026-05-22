/** Customer Types */

export interface Customer {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    zipCode?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    idNumber?: string;
    idType?: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE';
    avatar?: string;
    notes?: string;
    isActive: boolean;
    pets?: string[]; // Pet IDs
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    zipCode?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    idNumber?: string;
    idType?: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE';
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
    id: string;
}

export interface CustomerListResponse {
    data: Customer[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CustomerSearchFilters {
    search?: string;
    city?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
