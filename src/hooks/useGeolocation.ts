import { createSignal } from "solid-js";
import { geolocationService } from "../services/geolocationService";
import { searchNearbyServices, setSearchAddressLabel, setEmptyStateReason } from "../store/locationStore";
import { toast } from "../store/toastStore";
import type { GeolocationError } from "../types/location";

export interface UseGeolocation {
    isLocating: () => boolean;
    locateUser: () => Promise<void>;
}

/**
 * Aciona a Geolocation API do navegador e, em caso de sucesso, dispara a
 * busca de estabelecimentos próximos. Usado tanto na entrada automática da
 * página quanto no botão "usar minha localização".
 */
export function useGeolocation(): UseGeolocation {
    const [isLocating, setIsLocating] = createSignal(false);

    const locateUser = async (): Promise<void> => {
        setIsLocating(true);
        try {
            const coordinates = await geolocationService.getCurrentPosition();
            setSearchAddressLabel("sua localização atual");
            await searchNearbyServices(coordinates);
        } catch (error) {
            const geolocationError = error as GeolocationError;
            setEmptyStateReason(geolocationError.reason === "permission-denied" ? "no-permission" : "error");
            toast.error(geolocationError.message ?? "Não foi possível obter sua localização.");
        } finally {
            setIsLocating(false);
        }
    };

    return { isLocating, locateUser };
}
