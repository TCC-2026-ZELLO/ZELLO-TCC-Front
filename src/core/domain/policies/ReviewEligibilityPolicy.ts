export const REVIEW_WINDOW_DAYS = 30;

export const ReviewEligibilityPolicy = {
    isExpired(appointmentDateIso: string, referenceDate: Date = new Date()): boolean {
        if (!appointmentDateIso) return true;
        const normalized = appointmentDateIso.includes("T")
            ? new Date(appointmentDateIso)
            : new Date(`${appointmentDateIso}T00:00:00`);
        if (Number.isNaN(normalized.getTime())) return false;

        const cutoff = new Date(referenceDate);
        cutoff.setDate(cutoff.getDate() - REVIEW_WINDOW_DAYS);
        cutoff.setHours(0, 0, 0, 0);
        return normalized < cutoff;
    },

    canReviewTarget(
        targetType: "PROFESSIONAL" | "BUSINESS",
        appointment: { professional?: unknown; business?: unknown },
        existingTargetTypes: readonly string[],
    ): boolean {
        if (existingTargetTypes.includes(targetType)) return false;
        if (targetType === "PROFESSIONAL") return Boolean(appointment.professional);
        return Boolean(appointment.business);
    },
};
