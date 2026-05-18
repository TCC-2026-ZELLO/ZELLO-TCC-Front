import { http } from "./api";

export interface Bound {
    start: string;
    end: string;
    durationAvailable: number;
}

export const availabilityService = {
    getBounds: (params: { date: string; professionalId: string; businessId: string; serviceId: string }) => {
        const query = new URLSearchParams(params).toString();
        return http.get<Bound[]>(`/availability/bounds?${query}`);
    },

    saveOperatingHour: (data: { businessId: string; dayOfWeek: number; startTime: string; endTime: string; isOpen: boolean }) =>
        http.post("/availability/operating-hours", data),

    saveShift: (data: { businessProfessionalId: string; dayOfWeek: number; startTime: string; endTime: string }) =>
        http.post("/availability/shifts", data),

    createException: (data: { businessId?: string; professionalId?: string; date?: string; dates?: string[]; startTime: string; endTime: string; reason: string; forceOverwritePending?: boolean; skipConflicts?: boolean }) =>
        http.post("/availability/exceptions", data),
        
    getExceptions: (params?: { professionalId?: string; businessId?: string }) => {
        const query = params ? new URLSearchParams(params as any).toString() : "";
        return http.get<any[]>(`/availability/exceptions${query ? `?${query}` : ''}`);
    },

    deleteException: (id: string) => 
        http.delete(`/availability/exceptions/${id}`),
};