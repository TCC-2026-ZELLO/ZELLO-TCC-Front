import type { ExchangeRates } from "../../domain/entities/models";
import type {
    IExchangeRateGateway,
    IGeocodingGateway,
    IGeolocationGateway,
    IHttpClient,
    ILocaleProvider,
    IStorageGateway,
} from "../../domain/ports";
import type {
    AddressSearchResult,
    GeolocationCoordinates,
    GeolocationError,
    GeolocationErrorReason,
} from "../../../types/location";
import { STORAGE_KEYS } from "../storage/StorageAdapters";

export const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
    BRL: 1,
    USD: 0.18,
    EUR: 0.165,
    updatedAt: "2026-10-01T00:00:00Z",
};

export class ExchangeRateAdapter implements IExchangeRateGateway {
    private currentRates: ExchangeRates;

    constructor(private readonly storage: IStorageGateway) {
        this.currentRates =
            this.storage.get<ExchangeRates>(STORAGE_KEYS.EXCHANGE_RATES) ??
            FALLBACK_EXCHANGE_RATES;
    }

    getRates(): ExchangeRates {
        return this.currentRates;
    }

    async refreshRates(): Promise<ExchangeRates> {
        try {
            const response = await fetch("https://open.er-api.com/v6/latest/BRL");
            if (!response.ok) return this.currentRates;
            const json = await response.json();
            if (json?.rates?.USD && json?.rates?.EUR) {
                this.currentRates = {
                    BRL: 1,
                    USD: Number(json.rates.USD),
                    EUR: Number(json.rates.EUR),
                    updatedAt: new Date().toISOString(),
                };
                this.storage.set(STORAGE_KEYS.EXCHANGE_RATES, this.currentRates);
            }
        } catch {}
        return this.currentRates;
    }
}

export class NominatimGeocodingAdapter implements IGeocodingGateway {
    private static readonly SEARCH_URL = "https://nominatim.openstreetmap.org/search";

    constructor(
        private readonly localeProvider: ILocaleProvider,
        private readonly contactEmail?: string,
    ) {}

    async searchAddress(query: string): Promise<AddressSearchResult | null> {
        const trimmed = query.trim();
        if (!trimmed) return null;

        const params = new URLSearchParams({
            q: trimmed,
            format: "json",
            limit: "1",
            addressdetails: "0",
            "accept-language": this.localeProvider.getBcp47Locale(),
        });
        if (this.contactEmail) params.set("email", this.contactEmail);

        const response = await fetch(`${NominatimGeocodingAdapter.SEARCH_URL}?${params.toString()}`, {
            headers: {
                Accept: "application/json",
                "Accept-Language": this.localeProvider.getBcp47Locale(),
            },
        });

        if (!response.ok) {
            throw new Error("GEOCODING_REQUEST_FAILED");
        }

        const results = (await response.json()) as Array<{
            display_name: string;
            lat: string;
            lon: string;
        }>;
        if (results.length === 0) return null;

        const [first] = results;
        return {
            displayName: first.display_name,
            latitude: Number(first.lat),
            longitude: Number(first.lon),
        };
    }
}

export class BrowserGeolocationAdapter implements IGeolocationGateway {
    private static readonly DEFAULT_OPTIONS: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    };

    isSupported(): boolean {
        return typeof navigator !== "undefined" && Boolean(navigator.geolocation);
    }

    private mapReason(code: number): GeolocationErrorReason {
        if (code === 1) return "permission-denied";
        if (code === 3) return "timeout";
        return "position-unavailable";
    }

    getCurrentPosition(
        options: PositionOptions = BrowserGeolocationAdapter.DEFAULT_OPTIONS,
    ): Promise<GeolocationCoordinates> {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                const error: GeolocationError = {
                    reason: "unsupported",
                    message: "GEOLOCATION_UNSUPPORTED",
                };
                reject(error);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    }),
                (posErr) => {
                    const error: GeolocationError = {
                        reason: this.mapReason(posErr.code),
                        message: `GEOLOCATION_${posErr.code}`,
                    };
                    reject(error);
                },
                options,
            );
        });
    }
}

export interface ViaCepAddressDto {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export class ViaCepGateway {
    async lookup(cep: string): Promise<ViaCepAddressDto | null> {
        const digits = cep.replace(/\D/g, "");
        if (digits.length !== 8) return null;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            if (!res.ok) return null;
            const data = (await res.json()) as ViaCepAddressDto;
            if (data.erro) return null;
            return data;
        } catch {
            return null;
        }
    }
}

export interface CnpjCompanyDto {
    nome: string;
    fantasia: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
}

export class CnpjLookupGateway {
    constructor(private readonly httpClient: IHttpClient) {}

    async lookup(cnpj: string): Promise<CnpjCompanyDto | null> {
        const digits = cnpj.replace(/\D/g, "");
        if (digits.length !== 14) return null;
        try {
            return await this.httpClient.get<CnpjCompanyDto>(`/lookup/cnpj/${digits}`);
        } catch {
            return null;
        }
    }
}
