import type { GeolocationCoordinates, GeolocationError, GeolocationErrorReason } from "../types/location";

const DEFAULT_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
};

function isGeolocationSupported(): boolean {
    return typeof navigator !== "undefined" && !!navigator.geolocation;
}

const GEOLOCATION_ERROR_CODE = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
} as const;

function mapErrorReason(code: number): GeolocationErrorReason {
    switch (code) {
        case GEOLOCATION_ERROR_CODE.PERMISSION_DENIED:
            return "permission-denied";
        case GEOLOCATION_ERROR_CODE.TIMEOUT:
            return "timeout";
        case GEOLOCATION_ERROR_CODE.POSITION_UNAVAILABLE:
        default:
            return "position-unavailable";
    }
}

function describeError(code: number): string {
    switch (code) {
        case GEOLOCATION_ERROR_CODE.PERMISSION_DENIED:
            return "Permissão de localização negada. Você pode buscar por endereço manualmente.";
        case GEOLOCATION_ERROR_CODE.TIMEOUT:
            return "Tempo esgotado ao tentar obter sua localização.";
        case GEOLOCATION_ERROR_CODE.POSITION_UNAVAILABLE:
        default:
            return "Não foi possível determinar sua localização no momento.";
    }
}

function getCurrentPosition(options: PositionOptions = DEFAULT_OPTIONS): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        if (!isGeolocationSupported()) {
            const error: GeolocationError = {
                reason: "unsupported",
                message: "Seu navegador não suporta geolocalização.",
            };
            reject(error);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (positionError) => {
                const error: GeolocationError = {
                    reason: mapErrorReason(positionError.code),
                    message: describeError(positionError.code),
                };
                reject(error);
            },
            options,
        );
    });
}

export const geolocationService = { isGeolocationSupported, getCurrentPosition };
