import type { TimeBound } from "../entities/models";

export const SlotCalculator = {
    timeToMinutes(time: string): number {
        const [hours = 0, mins = 0] = time.split(":").map(Number);
        if (Number.isNaN(hours) || Number.isNaN(mins)) return 0;
        return hours * 60 + mins;
    },

    minutesToTime(totalMinutes: number): string {
        const safe = Math.max(0, Math.floor(totalMinutes));
        const hh = Math.floor(safe / 60).toString().padStart(2, "0");
        const mm = (safe % 60).toString().padStart(2, "0");
        return `${hh}:${mm}`;
    },

    totalRequiredDuration(durationMinutes: number, cleanupMinutes = 0): number {
        return Math.max(0, (Number(durationMinutes) || 0) + (Number(cleanupMinutes) || 0));
    },

    generateAvailableSlots(
        bounds: readonly TimeBound[],
        durationMinutes: number,
        stepMinutes?: number,
        cleanupMinutes = 0,
    ): string[] {
        const totalDuration = SlotCalculator.totalRequiredDuration(durationMinutes, cleanupMinutes);
        if (totalDuration <= 0) return [];

        const effectiveStep = stepMinutes && stepMinutes > 0 ? stepMinutes : totalDuration;
        const seen = new Set<string>();
        const slots: string[] = [];

        for (const bound of bounds) {
            let current = SlotCalculator.timeToMinutes(bound.start);
            const end = SlotCalculator.timeToMinutes(bound.end);
            while (current + totalDuration <= end) {
                const slot = SlotCalculator.minutesToTime(current);
                if (!seen.has(slot)) {
                    seen.add(slot);
                    slots.push(slot);
                }
                current += effectiveStep;
            }
        }

        return slots;
    },
};
