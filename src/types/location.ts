
export interface GeolocationCoordinates {
    latitude: number;
    longitude: number;
}

export type GeolocationErrorReason =
    | "permission-denied"
    | "position-unavailable"
    | "timeout"
    | "unsupported";

export interface GeolocationError {
    reason: GeolocationErrorReason;
    message: string;
}

export interface ServiceLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    rating: number;
    category: string;
    services: string;
    distanceKm: number;
}

/** Corresponde ao corpo de resposta de `GET /services/location`. */
export interface SearchServicesByLocationResponse {
    status: number;
    data: ServiceLocation[];
    total: number;
    message?: string;
}

/** Resultado de geocodificação de um endereço/CEP via Nominatim. */
export interface AddressSearchResult {
    displayName: string;
    latitude: number;
    longitude: number;
}

export type EmptyStateReason = "idle" | "no-permission" | "no-results" | "error";
