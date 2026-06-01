import { http } from "./api";
import { getActiveBizId } from "~/store/appState";

export interface CreateAppointmentDto {
    professionalId?: string;
    businessId: string;
    serviceId: string;
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
};