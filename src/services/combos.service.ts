import { formatMoney } from "../core/i18n";
import { unwrapEnvelope } from "../core/infrastructure/mappers/DtoMappers";
import { http } from "./api";

export interface ComboServiceUI {
    id: string;
    name: string;
    durationMinutes: number;
    cleanupMinutes: number;
    price: number;
}

export interface ComboStageUI {
    sequence: number;
    offsetMinutes: number;
    durationMinutes: number;
    services: ComboServiceUI[];
}

export interface ComboUI {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    originalPrice: number;
    price: number;
    discount: number;
    discountPercent: number;
    durationMinutes: number;
    requiresMultipleProfessionals: boolean;
    stages: ComboStageUI[];
}

export interface ComboAssignmentUI {
    sequence: number;
    serviceId: string;
    serviceName: string;
    professionalId: string;
    professionalName: string;
    startTime: string;
    endTime: string;
    blockedUntil: string;
}

export interface ComboSlotUI {
    startTime: string;
    endTime: string;
    assignments: ComboAssignmentUI[];
}

export interface ComboInput {
    name: string;
    description?: string;
    price: number;
    items: { serviceId: string; sequence: number }[];
    active?: boolean;
}

export interface ComboBookingGroupUI {
    id: string;
    status: string;
    date: string;
    startTime: string;
    endTime?: string;
    totalPrice?: number;
    price?: number;
    combo?: {
        id: string;
        name: string;
        price?: number;
    };
    client?: {
        id?: string;
        name?: string;
        user?: { name?: string };
    };
    appointments?: Array<{
        id: string;
        startTime: string;
        endTime?: string;
        service?: { id: string; name: string };
        professional?: { id: string; user?: { name?: string }; name?: string };
    }>;
    rejectionReason?: string | null;
}

export const combosService = {
    list: async (businessId: string, includeInactive = false): Promise<ComboUI[]> => {
        const raw = await http.get<any>(
            `/combos/business/${businessId}?includeInactive=${includeInactive}`,
        );
        const list = unwrapEnvelope<ComboUI[]>(raw);
        return Array.isArray(list) ? list : [];
    },

    getById: async (comboId: string): Promise<ComboUI> => {
        const raw = await http.get<any>(`/combos/${comboId}`);
        return unwrapEnvelope<ComboUI>(raw);
    },

    create: async (businessId: string, data: ComboInput): Promise<ComboUI> => {
        const raw = await http.post<any>(`/combos/business/${businessId}`, data);
        return unwrapEnvelope<ComboUI>(raw);
    },

    update: async (comboId: string, data: Partial<ComboInput>): Promise<ComboUI> => {
        const raw = await http.patch<any>(`/combos/${comboId}`, data);
        return unwrapEnvelope<ComboUI>(raw);
    },

    delete: (comboId: string) => http.delete(`/combos/${comboId}`),

    availability: async (comboId: string, date: string): Promise<ComboSlotUI[]> => {
        const raw = await http.get<any>(`/combos/${comboId}/availability?date=${date}`);
        const list = unwrapEnvelope<ComboSlotUI[]>(raw);
        return Array.isArray(list) ? list : [];
    },

    book: (
        comboId: string,
        payload: {
            date: string;
            startTime: string;
            professionals?: { serviceId: string; professionalId: string }[];
        },
    ) => http.post(`/combo-bookings/combo/${comboId}`, payload),

    myBookings: async (): Promise<ComboBookingGroupUI[]> => {
        const raw = await http.get<any>(`/combo-bookings/me`);
        const list = unwrapEnvelope<ComboBookingGroupUI[]>(raw);
        return Array.isArray(list) ? list : [];
    },

    queue: async (businessId: string, status = "PENDING"): Promise<ComboBookingGroupUI[]> => {
        const raw = await http.get<any>(
            `/combo-bookings/business/${businessId}?status=${status}`,
        );
        const list = unwrapEnvelope<ComboBookingGroupUI[]>(raw);
        return Array.isArray(list) ? list : [];
    },

    approve: (groupId: string) => http.patch(`/combo-bookings/${groupId}/approve`, {}),

    reject: (groupId: string, reason: string) =>
        http.patch(`/combo-bookings/${groupId}/reject`, { reason }),

    cancel: (groupId: string) => http.patch(`/combo-bookings/${groupId}/cancel`, {}),
};

export const brl = (value: number): string => formatMoney(value ?? 0);