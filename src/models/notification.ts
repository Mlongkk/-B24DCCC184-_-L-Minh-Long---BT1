/** Notification Types */

export interface Notification {
    id: string;
    userId?: string;
    customerId?: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    isRead: boolean;
    readAt?: string;
    scheduledTime?: string;
    sentTime?: string;
    deliveryChannels: DeliveryChannel[];
    status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
}

export enum NotificationType {
    APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
    APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
    APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
    APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
    MEDICAL_RECORD_CREATED = 'MEDICAL_RECORD_CREATED',
    PRESCRIPTION_READY = 'PRESCRIPTION_READY',
    VACCINATION_DUE = 'VACCINATION_DUE',
    SYSTEM_UPDATE = 'SYSTEM_UPDATE',
    URGENT_ALERT = 'URGENT_ALERT',
}

export enum NotificationCategory {
    APPOINTMENT = 'APPOINTMENT',
    MEDICAL = 'MEDICAL',
    REMINDER = 'REMINDER',
    SYSTEM = 'SYSTEM',
    URGENT = 'URGENT',
}

export enum DeliveryChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH',
    IN_APP = 'IN_APP',
}

export interface NotificationPreferences {
    userId: string;
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    appointmentReminders: boolean;
    medicalUpdates: boolean;
    systemNotifications: boolean;
    reminderMinutesBefore?: number; // Default: 60 minutes
}

export interface NotificationListResponse {
    data: Notification[];
    total: number;
    page: number;
    pageSize: number;
    unreadCount: number;
}

export interface NotificationFilter {
    userId?: string;
    customerId?: string;
    type?: NotificationType;
    category?: NotificationCategory;
    isRead?: boolean;
    priority?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
