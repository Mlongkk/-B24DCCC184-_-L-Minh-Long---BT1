/** Appointment & Scheduling Types */

export interface Appointment {
    id: string;
    customerId: string;
    customerName?: string;
    petId: string;
    petName?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    veterinarian?: string;
    veterinarianId?: string;
    reason: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    reminderSent: boolean;
    reminderSentAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAppointmentRequest {
    customerId: string;
    petId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    reason: string;
    veterinarianId?: string;
    notes?: string;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
    id: string;
}

export interface AppointmentListResponse {
    data: Appointment[];
    total: number;
    page: number;
    pageSize: number;
}

export interface AppointmentSearchFilters {
    customerId?: string;
    petId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
    veterinarianId?: string;
}

export interface DaySchedule {
    date: string;
    timeSlots: TimeSlot[];
    isAvailable: boolean;
}

export interface AppointmentNotification {
    id: string;
    appointmentId: string;
    customerId: string;
    type: 'EMAIL' | 'SMS' | 'PUSH';
    scheduledTime: string;
    sentTime?: string;
    status: 'PENDING' | 'SENT' | 'FAILED';
    message: string;
}
