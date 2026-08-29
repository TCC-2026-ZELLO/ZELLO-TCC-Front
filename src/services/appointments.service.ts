import { http } from "./api";
import { getActiveBizId } from "../store/appState";
export const MAX_RESCHEDULES = 2;

export interface CreateAppointmentDto {
    professionalId?: string;
    businessId: string;
    serviceId: string;
    date: string;
    startTime: string;
}

export interface RescheduleAppointmentDto {
    date: string;
    startTime: string;
}

export const appointmentsService = {
    create: async (data: CreateAppointmentDto) => {
        const res = await http.post<any>("/appointments", data);
        return res.data || res;
    },

    getMyAppointments: async () => {
        const res = await http.get<any>("/appointments/me");
        return res.data || res;
    },

    cancel: async (id: string) => {
        const res = await http.patch<any>(`/appointments/${id}/cancel`, {});
        return res.data || res;
    },

    getByBusiness: async (businessId: string) => {
        const res = await http.get<any>(`/appointments/business/${businessId}`);
        return res.data || res;
    },

    updateStatus: async (id: string, status: string) => {
        const res = await http.patch<any>(`/appointments/${id}/status`, { status });
        return res.data || res;
    },

    getAppointments: async (params: { date?: string; businessId?: string; professionalId?: string }) => {
        const baseParams = { businessId: getActiveBizId(), ...params };

        const cleanParams = Object.fromEntries(Object.entries(baseParams).filter(([_, v]) => v != null));
        const query = new URLSearchParams(cleanParams as Record<string, string>).toString();

        const res = await http.get<any>(`/appointments?${query}`);
        return res.data || res;
    },

    reschedule: async (id: string, data: RescheduleAppointmentDto) => {
        const res = await http.patch<any>(`/appointments/${id}/reschedule`, data);
        return res.data || res;
    },

    proposeReschedule: async (id: string, data: RescheduleAppointmentDto) => {
        const res = await http.post<any>(`/appointments/${id}/reschedule-proposal`, data);
        return res.data || res;
    },

    respondToProposal: async (id: string, accept: boolean) => {
        const res = await http.patch<any>(`/appointments/${id}/reschedule-proposal`, { accept });
        return res.data || res;
    },

    markNoShow: async (id: string) => {
        const res = await http.patch<any>(`/appointments/${id}/no-show`, {});
        return res.data || res;
    },

    revertNoShow: async (id: string) => {
        const res = await http.patch<any>(`/appointments/${id}/revert-no-show`, {});
        return res.data || res;
    },

    cancelJustified: async (id: string, reason: string, affectsReputation: boolean) => {
        const res = await http.patch<any>(`/appointments/${id}/cancel-justified`, { reason, affectsReputation });
        return res.data || res;
    },

    getClientReputation: async (clientId: string) => {
        const res = await http.get<any>(`/appointments/client/${clientId}/reputation`);
        return res.data || res;
    },
};