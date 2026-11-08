import { createSignal, onCleanup } from "solid-js";
import { t } from "../core/i18n";
import { geocodingService } from "../services/geocodingService";
import {
    searchNearbyServices,
    setEmptyStateReason,
    setSearchAddressLabel,
} from "../store/locationStore";
import { toast } from "../store/toastStore";

const DEBOUNCE_MS = 300;

export interface UseAddressSearch {
    query: () => string;
    isSearchingAddress: () => boolean;
    handleInput: (value: string) => void;
    searchNow: () => void;
}

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
                toast.info(t().location.errAddressNotFound);
                return;
            }
            setSearchAddressLabel(result.displayName);
            await searchNearbyServices({
                latitude: result.latitude,
                longitude: result.longitude,
            });
        } catch {
            setEmptyStateReason("error");
            toast.error(t().location.errAddressSearch);
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
