import type {
    AvailabilityQuery,
    OperatingHour,
    ScheduleException,
    TimeBound,
} from "../../domain/entities/models";
import type { IAvailabilityRepository } from "../../domain/ports";

export class CachedAvailabilityRepository implements IAvailabilityRepository {
    private readonly cache = new Map<string, TimeBound[]>();

    constructor(private readonly inner: IAvailabilityRepository) {}

    private buildKey(query: AvailabilityQuery): string {
        return [
            query.businessId,
            query.serviceId,
            query.professionalId || "any",
            query.date,
        ].join("|");
    }

    getCachedBounds(query: AvailabilityQuery): TimeBound[] | undefined {
        return this.cache.get(this.buildKey(query));
    }

    async refreshBounds(query: AvailabilityQuery): Promise<TimeBound[]> {
        const fresh = await this.inner.getBounds(query);
        this.cache.set(this.buildKey(query), fresh);
        return fresh;
    }

    invalidateBounds(query?: AvailabilityQuery): void {
        if (!query) {
            this.cache.clear();
            return;
        }
        this.cache.delete(this.buildKey(query));
    }

    getBounds(query: AvailabilityQuery): Promise<TimeBound[]> {
        return this.inner.getBounds(query);
    }

    getOperatingHours(businessId: string): Promise<OperatingHour[]> {
        return this.inner.getOperatingHours(businessId);
    }

    saveOperatingHour(data: OperatingHour): Promise<unknown> {
        this.cache.clear();
        return this.inner.saveOperatingHour(data);
    }

    saveShift(data: {
        businessProfessionalId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }): Promise<unknown> {
        this.cache.clear();
        return this.inner.saveShift(data);
    }

    createException(data: {
        businessId?: string;
        professionalId?: string;
        date?: string;
        dates?: string[];
        startTime: string;
        endTime: string;
        reason: string;
        forceOverwritePending?: boolean;
        skipConflicts?: boolean;
    }): Promise<unknown> {
        this.cache.clear();
        return this.inner.createException(data);
    }

    getExceptions(params?: {
        professionalId?: string;
        businessId?: string;
        date?: string;
    }): Promise<ScheduleException[]> {
        return this.inner.getExceptions(params);
    }

    deleteException(id: string): Promise<unknown> {
        this.cache.clear();
        return this.inner.deleteException(id);
    }
}
