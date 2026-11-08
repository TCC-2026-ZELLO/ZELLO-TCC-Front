import { container } from "../core/container";
import type {
    AvailabilityQuery,
    OperatingHour,
    ScheduleException,
    TimeBound,
} from "../core/domain/entities/models";
import { SlotCalculator } from "../core/domain/policies/SlotCalculator";

export type Bound = TimeBound;
export type BoundsParams = AvailabilityQuery;

export const availabilityService = {
    getBounds: (params: BoundsParams): Promise<Bound[]> =>
        container.availabilityRepo.getBounds(params),

    getCachedBounds: (params: BoundsParams): Bound[] | undefined =>
        container.availabilityRepo.getCachedBounds(params),

    refreshBounds: (params: BoundsParams): Promise<Bound[]> =>
        container.availabilityRepo.refreshBounds(params),

    generateAvailableSlots: (
        bounds: Bound[],
        durationMinutes: number,
        stepMinutes: number = durationMinutes,
        cleanupMinutes = 0,
    ): string[] =>
        SlotCalculator.generateAvailableSlots(bounds, durationMinutes, stepMinutes, cleanupMinutes),

    getOperatingHours: (businessId: string): Promise<OperatingHour[]> =>
        container.availabilityRepo.getOperatingHours(businessId),

    saveOperatingHour: (data: OperatingHour) =>
        container.availabilityRepo.saveOperatingHour(data),

    saveShift: (data: {
        businessProfessionalId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }) => container.availabilityRepo.saveShift(data),

    createException: (data: {
        businessId?: string;
        professionalId?: string;
        date?: string;
        dates?: string[];
        startTime: string;
        endTime: string;
        reason: string;
        forceOverwritePending?: boolean;
        skipConflicts?: boolean;
    }) => container.availabilityRepo.createException(data),

    getExceptions: (params?: {
        professionalId?: string;
        businessId?: string;
        date?: string;
    }): Promise<ScheduleException[]> => container.availabilityRepo.getExceptions(params),

    deleteException: (id: string) => container.availabilityRepo.deleteException(id),
};
