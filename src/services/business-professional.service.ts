import { http } from "./api";
import { getActiveBizId } from "../store/appState";

export interface ProfessionalUser {
    id: string;
    name: string;
    email?: string;
}

export interface ProfessionalData {
    id: string;
    user?: ProfessionalUser;
}

export interface BusinessProfessional {
    id: string;
    businessId: string;
    professional: ProfessionalData;
}

export const businessProfessionalService = {
    getProfessionals: async (params?: { businessId?: string }) => {
        const businessId = params?.businessId || getActiveBizId();

        if (!businessId) {
            throw new Error("ID da empresa ausente.");
        }

        const res = await http.get<any>(`/business-professionals/business/${businessId}`);
        return res.data || res;
    }
};