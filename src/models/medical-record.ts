/** Medical Record Types */

export interface MedicalRecord {
    id: string;
    petId: string;
    petName?: string;
    customerId: string;
    customerName?: string;
    appointmentId?: string;
    visitDate: string;
    veterinarian: string;
    veterinarianId: string;
    diagnosis: string;
    treatment: string;
    prescription?: Prescription[];
    vitals?: PetVitals;
    attachments?: Attachment[];
    notes?: string;
    followUpDate?: string;
    status: 'DRAFT' | 'COMPLETED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
}

export interface PetVitals {
    temperature?: number; // Celsius
    heartRate?: number; // bpm
    respiratoryRate?: number; // breaths/min
    weight?: number; // kg
    bloodPressure?: string;
    notes?: string;
}

export interface Prescription {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    refillable?: boolean;
    refillsRemaining?: number;
}

export interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
}

export interface MedicalTimeline {
    petId: string;
    records: MedicalTimelineEntry[];
}

export interface MedicalTimelineEntry {
    id: string;
    date: string;
    type: 'APPOINTMENT' | 'DIAGNOSIS' | 'TREATMENT' | 'VACCINATION' | 'NOTE';
    title: string;
    description: string;
    veterinarian?: string;
    recordId?: string;
}

export interface CreateMedicalRecordRequest {
    petId: string;
    visitDate: string;
    veterinarianId: string;
    diagnosis: string;
    treatment: string;
    vitals?: PetVitals;
    prescription?: Array<Omit<Prescription, 'id'>>;
    notes?: string;
    followUpDate?: string;
}

export interface UpdateMedicalRecordRequest extends Partial<CreateMedicalRecordRequest> {
    id: string;
}

export interface MedicalRecordListResponse {
    data: MedicalRecord[];
    total: number;
    page: number;
    pageSize: number;
}
