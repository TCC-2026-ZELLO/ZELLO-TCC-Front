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

export const combosService = {
    list: (businessId: string, includeInactive = false): Promise<ComboUI[]> =>
        http.get(`/combos/business/${businessId}?includeInactive=${includeInactive}`),

    getById: (comboId: string): Promise<ComboUI> => http.get(`/combos/${comboId}`),

    create: (businessId: string, data: ComboInput): Promise<ComboUI> =>
        http.post(`/combos/business/${businessId}`, data),

    update: (comboId: string, data: Partial<ComboInput>): Promise<ComboUI> =>
        http.patch(`/combos/${comboId}`, data),

    delete: (comboId: string) => http.delete(`/combos/${comboId}`),

    availability: (comboId: string, date: string): Promise<ComboSlotUI[]> =>
        http.get(`/combos/${comboId}/availability?date=${date}`),

    // ─── Solicitações ─────────────────────────────────────────────────────────

    book: (
        comboId: string,
        payload: {
            date: string;
            startTime: string;
            professionals?: { serviceId: string; professionalId: string }[];
        }
    ) => http.post(`/combo-bookings/combo/${comboId}`, payload),

    myBookings: () => http.get(`/combo-bookings/me`),

    queue: (businessId: string, status = "PENDING") =>
        http.get(`/combo-bookings/business/${businessId}?status=${status}`),

    approve: (groupId: string) => http.patch(`/combo-bookings/${groupId}/approve`, {}),

    reject: (groupId: string, reason: string) =>
        http.patch(`/combo-bookings/${groupId}/reject`, { reason }),

    cancel: (groupId: string) => http.patch(`/combo-bookings/${groupId}/cancel`, {}),
};

export const brl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);