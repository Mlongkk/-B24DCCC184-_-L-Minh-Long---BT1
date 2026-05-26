/** Pet Types */

export interface Pet {
    id: string;
    name: string;
    owner_id: string;
    customerName?: string;
    owner?: {
        id: string;
        username: string;
        full_name: string;
        email: string;
        phone?: string;
    };
    species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
    breed: string;
    gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
    dateOfBirth?: string;
    birth_date?: string; // backend format
    weight?: number; // in kg
    color?: string;
    microchipId?: string;
    avatar?: string;
    image_url?: string; // backend format
    medicalHistory?: string[];
    vaccinations?: Vaccination[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
        appointments?: any[];
    medicalRecords?: any[];
}

export interface Vaccination {
    id: string;
    name: string;
    vaccinatedDate: string;
    expiryDate?: string;
    veterinarian?: string;
    notes?: string;
}

export interface CreatePetRequest {
    name: string;
    owner_id: string;
    species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
    breed: string;
    gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
    birth_date?: string; // ISO date format: 2025-01-15
    weight?: number;
    color?: string;
    microchipId?: string;
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {
    id: string;
}

export interface PetListResponse {
    data: Pet[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PetSearchFilters {
    search?: string;
    owner_id?: string;
    species?: string;
    gender?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
}

export interface PetDependencies {
    appointments: number;
    medicalRecords: number;
    invoices: number;
    invoiceItems: number;
    hasRelations: boolean;
    details: {
        appointmentIds: string[];
        medicalRecordIds: string[];
        invoiceIds: string[];
    };
}

export interface DeletePetResponse {
    success: boolean;
    message: string;
    deletedRecords: {
        pet: string;
        appointments: number;
        medicalRecords: number;
        invoices: number;
        totalInvoiceItems: number;
    };
}
