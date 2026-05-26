/** Appointment & Scheduling Types */

export interface Appointment {
    id: string;
    customerId: string;
    customer_id?: string;
    customerName?: string;
    petId: string;
    pet_id?: string;
    petName?: string;
    appointmentDate: string;
    appointment_date?: string;
    startTime: string;
    endTime: string;
    veterinarian?: string;
    veterinarianId?: string;
    doctor_id?: string;
    doctorId?: string;
    reason: string;
    status: 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    priority_level?: 'EMERGENCY' | 'URGENT' | 'NORMAL';
    notes?: string;
    reminderSent: boolean;
    reminderSentAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAppointmentRequest {
    pet_id: string;
    appointment_date: string;
    doctor_id?: string;
    reason?: string;
    priority_level?: 'EMERGENCY' | 'URGENT' | 'NORMAL';
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
    id: string;
}

export interface AppointmentListResponse {
    success: boolean;
    data: Appointment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AppointmentSearchFilters {
    limit?: number;
    customerId?: string;
    petId?: string;
    pet_id?: string;
    doctor_id?: string;
    veterinarianId?: string;
    status?: string;
    priority_level?: string;
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
