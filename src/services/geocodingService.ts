import type { AddressSearchResult } from "../types/location";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const MIN_REQUEST_INTERVAL_MS = 1000;

const CONTACT_EMAIL = import.meta.env.VITE_NOMINATIM_EMAIL as string | undefined;

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
}

let lastRequestAt = 0;

/**
 * Garante no máximo 1 requisição/segundo ao Nominatim, conforme a política
 * de uso do serviço público (não há chave de API — o limite é por IP/uso).
 */
async function throttleRequest(): Promise<void> {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    lastRequestAt = Date.now();
}

/**
 * Geocodifica um endereço ou CEP usando o Nominatim (OpenStreetMap).
 *
 * Nota técnica: o `fetch` do navegador não permite definir manualmente o
 * header `User-Agent` (é um "forbidden header name" da Fetch spec). A
 * identificação recomendada pela política do Nominatim é satisfeita aqui
 * pelo header `Referer` — enviado automaticamente pelo navegador — e pelo
 * parâmetro opcional `email`, não por um `User-Agent` manual.
 */
async function searchAddress(query: string): Promise<AddressSearchResult | null> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return null;

    await throttleRequest();

    const params = new URLSearchParams({
        q: trimmedQuery,
        format: "json",
        limit: "1",
        addressdetails: "0",
    });
    if (CONTACT_EMAIL) params.set("email", CONTACT_EMAIL);

    const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error("Falha ao consultar o serviço de geocodificação.");
    }

    const results = (await response.json()) as NominatimResult[];
    if (results.length === 0) return null;

    const [first] = results;
    return {
        displayName: first.display_name,
        latitude: Number(first.lat),
        longitude: Number(first.lon),
    };
}

export const geocodingService = { searchAddress };
