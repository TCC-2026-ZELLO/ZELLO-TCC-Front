import { container } from "../core/container";
import { MAX_RESCHEDULES } from "../core/domain/policies/AppointmentPolicy";
import type { ListAppointmentsQuery } from "../core/domain/ports";
import { getActiveBizId } from "../store/appState";

export { MAX_RESCHEDULES };

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
    create: (data: CreateAppointmentDto) => container.appointmentRepo.create(data),

    getMyAppointments: () => container.appointmentRepo.getMyAppointments(),

    cancel: (id: string) => container.appointmentRepo.cancel(id),

    getByBusiness: (businessId: string) => container.appointmentRepo.getByBusiness(businessId),

    updateStatus: (id: string, status: string) =>
        container.appointmentRepo.updateStatus(id, status),

    getAppointments: (params: ListAppointmentsQuery = {}) => {
        const merged: ListAppointmentsQuery = {
            businessId: getActiveBizId(),
            ...params,
        };
        return container.appointmentRepo.list(merged);
    },

    reschedule: (id: string, data: RescheduleAppointmentDto) =>
        container.appointmentRepo.reschedule(id, data),

    proposeReschedule: (id: string, data: RescheduleAppointmentDto) =>
        container.appointmentRepo.proposeReschedule(id, data),

    respondToProposal: (id: string, accept: boolean) =>
        container.appointmentRepo.respondToProposal(id, accept),

    markNoShow: (id: string) => container.appointmentRepo.markNoShow(id),

    revertNoShow: (id: string) => container.appointmentRepo.revertNoShow(id),

    cancelJustified: (id: string, reason: string, affectsReputation: boolean) =>
        container.appointmentRepo.cancelJustified(id, reason, affectsReputation),

    getClientReputation: (clientId: string) =>
        container.appointmentRepo.getClientReputation(clientId),
};