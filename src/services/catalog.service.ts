import { http } from "./api";

export interface CatalogItemUI {
    id?: string;
    name: string;
    category?: string;
    price: number;
    durationMinutes: number;
    cleanupMinutes: number;
    active?: boolean;
}

export interface CatalogItemPayload {
    name: string;
    price: number;
    durationMinutes: number;
    cleanupMinutes: number;
}

const sanitizePayload = (data: CatalogItemUI): CatalogItemPayload => ({
    name: data.name,
    price: data.price,
    durationMinutes: data.durationMinutes,
    cleanupMinutes: data.cleanupMinutes || 0
});

export const catalogService = {
    list: (businessId: string) =>
        http.get<any[]>(`/catalog/business/${businessId}`),

    create: (businessId: string, data: CatalogItemUI) =>
        http.post(`/catalog/business/${businessId}`, sanitizePayload(data)),

    update: (id: string, data: CatalogItemUI) =>
        http.patch(`/catalog/${id}`, sanitizePayload(data)),

    toggleStatus: (id: string, active: boolean) =>
        console.warn("Backend não suporta toggle de status ainda."),

    delete: (id: string) =>
        http.delete(`/catalog/${id}`)
};