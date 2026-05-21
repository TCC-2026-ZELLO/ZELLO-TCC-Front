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
    },


    getQualifications: async (id: string) => {
        const res = await http.get<any>(`/professionals/${id}/qualifications`);
        return res.data || res;
    },

    addQualification: async (data: {
        file: File;
        title: string;
        institution?: string;
        type?: string;
        year?: number;
    }) => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('title', data.title);
        if (data.institution) formData.append('institution', data.institution);
        if (data.type)        formData.append('type', data.type);
        if (data.year)        formData.append('year', String(data.year));
        return await http.post('/professionals/me/qualifications', formData);
    },

    updateQualification: async (id: string, data: {
        file?: File;
        title?: string;
        institution?: string;
        type?: string;
        year?: number;
    }) => {
        const formData = new FormData();
        if (data.file)        formData.append('file', data.file);
        if (data.title)       formData.append('title', data.title);
        if (data.institution !== undefined) formData.append('institution', data.institution);
        if (data.type)        formData.append('type', data.type);
        if (data.year)        formData.append('year', String(data.year));
        return await http.patch(`/professionals/me/qualifications/${id}`, formData);
    },

    deleteQualification: async (id: string) => {
        return await http.delete(`/professionals/me/qualifications/${id}`);
    },
};