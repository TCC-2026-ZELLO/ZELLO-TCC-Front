import { container } from "../core/container";
import type { ShiftInterval, TeamMemberLink } from "../core/domain/entities/models";

export interface CreateBusinessProfessionalPayload {
    businessId: string;
    professionalId: string;
    active: boolean;
}

export const businessProfessionalsService = {
    listByBusiness: (businessId: string): Promise<TeamMemberLink[]> =>
        container.businessTeamRepo.listByBusiness(businessId),

    create: (data: { businessId: string; email: string; active: boolean }) =>
        container.businessTeamRepo.linkProfessional(data),

    remove: (id: string) => container.businessTeamRepo.unlinkProfessional(id),

    update: (id: string, data: Record<string, unknown>) =>
        container.businessTeamRepo.updateLink(id, data),

    findServices: (id: string) => container.businessTeamRepo.getAssignedServices(id),

    updateServices: (id: string, serviceIds: string[]) =>
        container.businessTeamRepo.updateAssignedServices(id, serviceIds),

    findShifts: (id: string) => container.businessTeamRepo.getShifts(id),

    updateShifts: (id: string, shifts: ShiftInterval[]) =>
        container.businessTeamRepo.updateShifts(id, shifts),
};