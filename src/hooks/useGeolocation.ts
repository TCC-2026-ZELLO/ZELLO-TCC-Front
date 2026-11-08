import { createSignal } from "solid-js";
import { localizeDomain, t } from "../core/i18n";
import { geolocationService } from "../services/geolocationService";
import {
    searchNearbyServices,
    setEmptyStateReason,
    setSearchAddressLabel,
} from "../store/locationStore";
import { toast } from "../store/toastStore";
import type { GeolocationError } from "../types/location";

export interface UseGeolocation {
    isLocating: () => boolean;
    locateUser: () => Promise<void>;
}

export function useGeolocation(): UseGeolocation {
    const [isLocating, setIsLocating] = createSignal(false);

    const locateUser = async (): Promise<void> => {
        setIsLocating(true);
        try {
            const coordinates = await geolocationService.getCurrentPosition();
            setSearchAddressLabel(t().location.myCurrentLocation);
            await searchNearbyServices(coordinates);
        } catch (error) {
            const geolocationError = error as GeolocationError;
            setEmptyStateReason(
                geolocationError.reason === "permission-denied"
                    ? "no-permission"
                    : "error",
            );
            const fallbackMsg =
                geolocationError.reason === "permission-denied"
                    ? t().location.errPermissionDenied
                    : geolocationError.reason === "timeout"
                      ? t().location.errTimeout
                      : geolocationError.reason === "unsupported"
                        ? t().location.errUnsupported
                        : t().location.errGeolocationFailed;
            toast.error(localizeDomain.apiError(geolocationError.message, fallbackMsg));
        } finally {
            setIsLocating(false);
        }
    };

    return { isLocating, locateUser };
}
