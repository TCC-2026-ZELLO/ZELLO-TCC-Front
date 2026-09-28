import { For, onMount, Show } from "solid-js";
import { AddressSearchBar } from "../components/location/AddressSearchBar";
import { MapContainer } from "../components/location/MapContainer";
import { ServicePin } from "../components/location/ServicePin";
import { ServicePreviewModal } from "../components/location/ServicePreviewModal";
import { EmptyState } from "../components/location/EmptyState";
import { Loading } from "../components/common/Loading";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAddressSearch } from "../hooks/useAddressSearch";
import {
    emptyStateReason,
    hasResults,
    isSearchingServices,
    nearbyServices,
    searchAddressLabel,
    selectedService,
    setSelectedService,
    userCoordinates,
} from "../store/locationStore";

export default function LocationSearch() {
    const { isLocating, locateUser } = useGeolocation();
    const { query, isSearchingAddress, handleInput, searchNow } = useAddressSearch();

    // Única chamada automática de geolocalização: ao montar a página.
    // Qualquer nova busca depois disso é sempre uma ação explícita do usuário.
    onMount(() => {
        void locateUser();
    });

    return (
        <div class="flex h-full flex-col gap-4 p-4 md:p-8">
            <div class="flex flex-col gap-1">
                <h1 class="text-2xl font-bold text-foreground tracking-tight">Estabelecimentos perto de você</h1>
                <p class="text-sm text-muted-foreground">
                    Mostrando resultados num raio de 10km
                    <Show when={searchAddressLabel()}>{(label) => <> de {label()}</>}</Show>.
                </p>
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
                fallback={<Loading label="Buscando estabelecimentos próximos…" />}
            >
                <Show
                    when={hasResults() ? userCoordinates() : null}
                    fallback={<EmptyState reason={emptyStateReason()} onRetryLocation={locateUser} />}
                >
                    {(center) => (
                        <div class="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[360px_1fr]">
                            <div class="flex flex-col gap-3 overflow-y-auto pr-1" aria-label="Lista de estabelecimentos encontrados">
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
                            <div class="min-h-[400px]">
                                <MapContainer
                                    center={center()}
                                    services={nearbyServices()}
                                    selectedServiceId={selectedService()?.id ?? null}
                                    onSelectService={setSelectedService}
                                />
                            </div>
                        </div>
                    )}
                </Show>
            </Show>

            <ServicePreviewModal service={selectedService()} onClose={() => setSelectedService(null)} />
        </div>
    );
}
