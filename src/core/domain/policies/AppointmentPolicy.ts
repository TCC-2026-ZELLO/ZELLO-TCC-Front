import type { Appointment, ClientReputation } from "../entities/models";

export const MAX_RESCHEDULES = 2;
const MANAGER_NO_SHOW_ROLES = new Set(["manager", "manager_noshow"]);
const HIGH_RISK_NO_SHOW_THRESHOLD = 3;

export const AppointmentPolicy = {
    remainingReschedules(
        appointment: Pick<Appointment, "rescheduleCount">,
        maxReschedules = MAX_RESCHEDULES,
    ): number {
        return Math.max(0, maxReschedules - (appointment.rescheduleCount ?? 0));
    },

    canCancel(appointment: Pick<Appointment, "status">): boolean {
        return appointment.status === "PENDING" || appointment.status === "CONFIRMED";
    },

    canReschedule(
        appointment: Pick<Appointment, "status" | "proposedDate">,
    ): boolean {
        return (
            (appointment.status === "PENDING" || appointment.status === "CONFIRMED") &&
            !appointment.proposedDate
        );
    },

    canProposeReschedule(
        appointment: Pick<Appointment, "status" | "proposedDate" | "rescheduleCount">,
        maxReschedules = MAX_RESCHEDULES,
    ): boolean {
        const isActive = appointment.status === "PENDING" || appointment.status === "CONFIRMED";
        return (
            isActive &&
            !appointment.proposedDate &&
            AppointmentPolicy.remainingReschedules(appointment, maxReschedules) > 0
        );
    },

    isManagerNoShow(
        appointment: Pick<Appointment, "status" | "cancelledByRole">,
    ): boolean {
        return (
            appointment.status === "NO_SHOW" &&
            !!appointment.cancelledByRole &&
            MANAGER_NO_SHOW_ROLES.has(appointment.cancelledByRole)
        );
    },

    isHighNoShowRisk(reputation?: ClientReputation | null): boolean {
        return (reputation?.noShowCount ?? 0) >= HIGH_RISK_NO_SHOW_THRESHOLD;
    },
};
