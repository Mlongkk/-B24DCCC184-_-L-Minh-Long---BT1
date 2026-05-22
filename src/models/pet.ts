/** Pet Types */

export interface Pet {
    id: string;
    name: string;
    customerId: string;
    customerName?: string;
    species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
    breed: string;
    dateOfBirth?: string;
    weight?: number; // in kg
    color?: string;
    microchipId?: string;
    avatar?: string;
    medicalHistory?: string[];
    vaccinations?: Vaccination[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
    customerId: string;
    species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
    breed: string;
    dateOfBirth?: string;
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
    customerId?: string;
    species?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
