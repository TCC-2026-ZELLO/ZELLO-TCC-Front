import { container } from "../core/container";
import { t } from "../core/i18n";
import type { GeolocationCoordinates, GeolocationError } from "../types/location";

function isGeolocationSupported(): boolean {
    return container.geolocationGateway.isSupported();
}

async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationCoordinates> {
    try {
        return await container.geolocationGateway.getCurrentPosition(options);
    } catch (err) {
        const geoErr = err as GeolocationError;
        const loc = t().location;
        const localizedMessage =
            geoErr?.reason === "permission-denied"
                ? loc.errPermissionDenied
                : geoErr?.reason === "timeout"
                  ? loc.errTimeout
                  : geoErr?.reason === "unsupported"
                    ? loc.errUnsupported
                    : loc.errUnavailable;
        const localizedError: GeolocationError = {
            reason: geoErr?.reason ?? "position-unavailable",
            message: localizedMessage,
        };
        throw localizedError;
    }
}

export const geolocationService = { isGeolocationSupported, getCurrentPosition };
