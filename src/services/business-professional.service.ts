import { container } from "../core/container";
import type { TeamMemberLink } from "../core/domain/entities/models";
import { getActiveBizId } from "../store/appState";

export type BusinessProfessional = TeamMemberLink;

export const businessProfessionalService = {
    getProfessionals: async (params?: { businessId?: string }): Promise<TeamMemberLink[]> => {
        const businessId = params?.businessId || getActiveBizId();
        if (!businessId) {
            throw new Error("ID da empresa ausente.");
        }
        return container.businessTeamRepo.listByBusiness(businessId);
    },
};