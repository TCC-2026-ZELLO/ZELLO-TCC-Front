import { http } from "./api";

export const businessService = {
    getById: async (id: string) => {
        const res = await http.get<any>(`/businesses/${id}`);
        return res.data || res;
    },

    getTeam: async (id: string) => {
        const res = await http.get<any>(`/business-professionals/business/${id}`);
        return res.data || res;
    },

    getCatalog: async (id: string) => {
        const res = await http.get<any>(`/catalog/business/${id}`);
        return res.data || res;
    },

    getProfile: (id: string) => http.get<any>(`/businesses/${id}`),

    getGallery: (id: string) => http.get<any[]>(`/businesses/${id}/gallery`),

    updateProfile: (id: string, data: any) =>
        http.patch(`/businesses/${id}/profile`, data),

    updatePhoto: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return http.post(`/businesses/${id}/photo`, formData);
    },

    updateBanner: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return http.post(`/businesses/${id}/banner`, formData);
    },

    addGalleryImage: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return http.post(`/businesses/${id}/gallery`, formData);
    },

    deleteGalleryImage: (businessId: string, imageId: string) =>
        http.delete(`/businesses/${businessId}/gallery/${imageId}`),
};