import { http } from "./api";

export interface CreateBusinessProfessionalPayload {
    businessId: string;
    professionalId: string;
    active: boolean;
}

export const businessProfessionalsService = {
    listByBusiness: async (businessId: string) => {
        const response = await http.get<any>(`/business-professionals/business/${businessId}`);
        return response.data || [];
    },

    create: (data: { businessId: string; email: string; active: boolean }) =>
        http.post(`/business-professionals`, data),

    remove: (id: string) =>
        http.delete(`/business-professionals/${id}`),

    update: (id: string, data: any) =>
        http.patch(`/business-professionals/${id}`, data),

    findServices: (id: string) => http.get<any>(`/business-professionals/${id}/services`),
    updateServices: (id: string, serviceIds: string[]) =>
        http.patch(`/business-professionals/${id}/services`, { serviceIds }),
};