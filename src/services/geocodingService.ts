import { container } from "../core/container";
import type { AddressSearchResult } from "../types/location";

async function searchAddress(query: string): Promise<AddressSearchResult | null> {
    return container.geocodingGateway.searchAddress(query);
}

export const geocodingService = { searchAddress };
