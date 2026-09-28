import { createSignal } from "solid-js";
import { serviceLocationService } from "../services/serviceLocationService";
import type { GeolocationCoordinates, ServiceLocation, EmptyStateReason } from "../types/location";

/**
 * Raio de busca exibido no mapa/textos da UI. É apenas informativo: o valor
 * real é fixo e aplicado pelo backend (RF13) — o frontend nunca o envia
 * como parâmetro nem o recalcula.
 */
export const SERVICES_SEARCH_RADIUS_KM = 10;

export const [userCoordinates, setUserCoordinates] = createSignal<GeolocationCoordinates | null>(null);
export const [searchAddressLabel, setSearchAddressLabel] = createSignal<string | null>(null);
export const [nearbyServices, setNearbyServices] = createSignal<ServiceLocation[]>([]);
export const [isSearchingServices, setIsSearchingServices] = createSignal(false);
export const [emptyStateReason, setEmptyStateReason] = createSignal<EmptyStateReason>("idle");
export const [selectedService, setSelectedService] = createSignal<ServiceLocation | null>(null);

export const hasResults = () => nearbyServices().length > 0;

/**
 * Único ponto de disparo da busca de estabelecimentos por geolocalização.
 *
 * Importante (CA da RF13): esta função só deve ser chamada a partir de uma
 * ação explícita do usuário — geolocalização automática inicial ou envio de
 * uma busca por endereço. Pan/zoom no mapa NUNCA deve chamar esta função:
 * `MapContainer` apenas lê `nearbyServices`/`userCoordinates` para desenhar,
 * sem jamais escrever neles.
 */
export async function searchNearbyServices(coordinates: GeolocationCoordinates): Promise<void> {
    setUserCoordinates(coordinates);
    setSelectedService(null);
    setIsSearchingServices(true);
    try {
        const response = await serviceLocationService.searchServicesByLocation(
            coordinates.latitude,
            coordinates.longitude,
        );
        setNearbyServices(response.data);
        setEmptyStateReason(response.data.length === 0 ? "no-results" : "idle");
    } catch {
        setNearbyServices([]);
        setEmptyStateReason("error");
    } finally {
        setIsSearchingServices(false);
    }
}

export function resetLocationSearch(): void {
    setUserCoordinates(null);
    setSearchAddressLabel(null);
    setNearbyServices([]);
    setEmptyStateReason("idle");
    setSelectedService(null);
}
