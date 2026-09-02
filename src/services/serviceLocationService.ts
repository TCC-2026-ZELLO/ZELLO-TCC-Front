import { http } from "./api";
import type { SearchServicesByLocationResponse } from "../types/location";

/**
 * Consome `GET /services/location` (RF13, backend). O raio de busca é fixo
 * em 10km e decidido inteiramente pelo backend — o frontend nunca envia nem
 * calcula raio, apenas as coordenadas do centro da busca.
 */
function searchServicesByLocation(
    latitude: number,
    longitude: number,
): Promise<SearchServicesByLocationResponse> {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
    });

    return http.get<SearchServicesByLocationResponse>(`/services/location?${params.toString()}`);
}

export const serviceLocationService = { searchServicesByLocation };
