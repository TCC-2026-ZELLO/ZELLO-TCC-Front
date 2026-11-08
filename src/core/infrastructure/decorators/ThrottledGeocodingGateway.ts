import type { IGeocodingGateway } from "../../domain/ports";
import type { AddressSearchResult } from "../../../types/location";

export class ThrottledGeocodingGateway implements IGeocodingGateway {
    private lastRequestAt = 0;

    constructor(
        private readonly inner: IGeocodingGateway,
        private readonly minIntervalMs = 1000,
    ) {}

    async searchAddress(query: string): Promise<AddressSearchResult | null> {
        const trimmed = query.trim();
        if (!trimmed) return null;

        const elapsed = Date.now() - this.lastRequestAt;
        if (this.lastRequestAt > 0 && elapsed < this.minIntervalMs) {
            await new Promise((resolve) =>
                setTimeout(resolve, this.minIntervalMs - elapsed),
            );
        }
        this.lastRequestAt = Date.now();

        return this.inner.searchAddress(trimmed);
    }
}
