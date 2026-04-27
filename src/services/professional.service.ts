import { http } from "./api";

export const professionalService = {
    getPublicProfile: async (id: string) => {
        const res = await http.get<any>(`/professionals/${id}`);
        return res.data || res;
    },

    getServices: async (id: string) => {
        const res = await http.get<any>(`/professionals/${id}/services`);
        return res.data || res;
    },

    getPortfolio: async (id: string) => {
        const res = await http.get<any>(`/professionals/${id}/portfolio`);
        return res.data || res;
    },

    updateProfile: async (data: { bio?: string, specialty?: string, visibilityStatus?: boolean }) => {
        return await http.patch('/professionals/me/profile', data);
    },

    updateAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return await http.post('/professionals/me/avatar', formData);
    },

    updateBanner: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return await http.post('/professionals/me/banner', formData);
    },

    uploadPortfolio: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return await http.post('/professionals/me/portfolio', formData);
    },

    deletePortfolioImage: async (id: string) => {
        return await http.delete(`/professionals/me/portfolio/${id}`);
    }
};