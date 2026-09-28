import { createSignal, onCleanup } from "solid-js";
import { geocodingService } from "../services/geocodingService";
import { searchNearbyServices, setSearchAddressLabel, setEmptyStateReason } from "../store/locationStore";
import { toast } from "../store/toastStore";

const DEBOUNCE_MS = 300;

export interface UseAddressSearch {
    query: () => string;
    isSearchingAddress: () => boolean;
    handleInput: (value: string) => void;
    searchNow: () => void;
}

/**
 * Campo de busca por endereço/CEP com debounce. A busca de estabelecimentos
 * só é disparada depois que a geocodificação resolve coordenadas — nunca a
 * cada tecla digitada.
 */
export function useAddressSearch(): UseAddressSearch {
    const [query, setQuery] = createSignal("");
    const [isSearchingAddress, setIsSearchingAddress] = createSignal(false);

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const runSearch = async (value: string): Promise<void> => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        setIsSearchingAddress(true);
        try {
            const result = await geocodingService.searchAddress(trimmedValue);
            if (!result) {
                setEmptyStateReason("no-results");
                toast.info("Nenhum endereço encontrado para essa busca.");
                return;
            }
            setSearchAddressLabel(result.displayName);
            await searchNearbyServices({ latitude: result.latitude, longitude: result.longitude });
        } catch {
            setEmptyStateReason("error");
            toast.error("Erro ao buscar o endereço informado.");
        } finally {
            setIsSearchingAddress(false);
        }
    };

    const handleInput = (value: string): void => {
        setQuery(value);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            void runSearch(value);
        }, DEBOUNCE_MS);
    };

    const searchNow = (): void => {
        if (debounceTimer) clearTimeout(debounceTimer);
        void runSearch(query());
    };

    onCleanup(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
    });

    return { query, isSearchingAddress, handleInput, searchNow };
}
