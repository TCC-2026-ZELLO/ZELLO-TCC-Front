import { createSignal, For, onMount, Show } from "solid-js";
import { Loading } from "../components/common/Loading";
import { AddressSearchBar } from "../components/location/AddressSearchBar";
import { EmptyState } from "../components/location/EmptyState";
import { MapContainer } from "../components/location/MapContainer";
import { ServicePin } from "../components/location/ServicePin";
import { ServicePreviewModal } from "../components/location/ServicePreviewModal";
import { formatDistance, t } from "../core/i18n";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { useGeolocation } from "../hooks/useGeolocation";
import {
    emptyStateReason,
    hasResults,
    isSearchingServices,
    nearbyServices,
    searchAddressLabel,
    SERVICES_SEARCH_RADIUS_KM,
    selectedService,
    setSelectedService,
    userCoordinates,
} from "../store/locationStore";

export default function LocationSearch() {
    const { isLocating, locateUser } = useGeolocation();
    const { query, isSearchingAddress, handleInput, searchNow } = useAddressSearch();
    const [mobilePane, setMobilePane] = createSignal<"list" | "map">("list");

    onMount(() => {
        void locateUser();
    });

    return (
        <div class="flex h-full flex-col gap-4 p-4 sm:p-6 md:p-8">
            <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div class="flex flex-col gap-1">
                    <h1 class="text-2xl font-bold tracking-tight text-foreground">
                        {t().location.title}
                    </h1>
                    <p class="text-sm text-muted-foreground">
                        {t().location.subtitleRadius(
                            formatDistance(SERVICES_SEARCH_RADIUS_KM, 0),
                        )}
                        <Show when={searchAddressLabel()}>
                            {(label) => <>{t().location.fromLabel(label())}</>}
                        </Show>
                        .
                    </p>
                </div>

                <Show when={hasResults()}>
                    <div class="inline-flex w-fit rounded-xl border border-border bg-card p-1 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobilePane("list")}
                            class={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                                mobilePane() === "list"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t().location.viewList} ({nearbyServices().length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobilePane("map")}
                            class={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                                mobilePane() === "map"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t().location.viewMap}
                        </button>
                    </div>
                </Show>
            </div>

            <AddressSearchBar
                query={query()}
                onInput={handleInput}
                onSubmit={searchNow}
                onUseMyLocation={locateUser}
                isSearchingAddress={isSearchingAddress()}
                isLocating={isLocating()}
            />

            <Show
                when={!isLocating() && !isSearchingServices()}
                fallback={<Loading label={t().location.loading} />}
            >
                <Show
                    when={hasResults() ? userCoordinates() : null}
                    fallback={
                        <EmptyState
                            reason={emptyStateReason()}
                            onRetryLocation={locateUser}
                        />
                    }
                >
                    {(center) => (
                        <div class="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[360px_1fr]">
                            <div
                                class={`flex-col gap-3 overflow-y-auto pr-1 ${
                                    mobilePane() === "list" ? "flex" : "hidden lg:flex"
                                }`}
                                aria-label={t().location.listAria}
                            >
                                <For each={nearbyServices()}>
                                    {(service) => (
                                        <ServicePin
                                            service={service}
                                            isActive={selectedService()?.id === service.id}
                                            onSelect={setSelectedService}
                                        />
                                    )}
                                </For>
                            </div>
                            <div
                                class={`min-h-[380px] sm:min-h-[440px] ${
                                    mobilePane() === "map" ? "block" : "hidden lg:block"
                                }`}
                            >
                                <MapContainer
                                    center={center()}
                                    services={nearbyServices()}
                                    selectedServiceId={selectedService()?.id ?? null}
                                    onSelectService={setSelectedService}
                                    visible={mobilePane() === "map"}
                                />
                            </div>
                        </div>
                    )}
                </Show>
            </Show>

            <ServicePreviewModal
                service={selectedService()}
                onClose={() => setSelectedService(null)}
            />
        </div>
    );
}
