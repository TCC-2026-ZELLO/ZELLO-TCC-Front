import { createEffect, on, onCleanup, onMount } from "solid-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeolocationCoordinates, ServiceLocation } from "../../types/location";
import { SERVICES_SEARCH_RADIUS_KM } from "../../store/locationStore";

export interface MapContainerProps {
    center: GeolocationCoordinates;
    services: ServiceLocation[];
    selectedServiceId: string | null;
    onSelectService: (service: ServiceLocation) => void;
}

const RADIUS_METERS = SERVICES_SEARCH_RADIUS_KM * 1000;
const DEFAULT_ZOOM = 13;

/** Cor do pin por categoria — mesma paleta de `--color-cliente/profissional/gestor` do design system. */
const CATEGORY_COLORS: Record<string, string> = {
    Cabelo: "#7C3AED",
    Unhas: "#0D9488",
    "Estética Facial": "#D97706",
    "Estética Corporal": "#3B82F6",
    Barbearia: "#1A2B42",
    Maquiagem: "#D4183D",
};
const DEFAULT_PIN_COLOR = "#5F6C7B";

function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] ?? DEFAULT_PIN_COLOR;
}

function buildPinIcon(color: string, isActive: boolean): L.DivIcon {
    const size = isActive ? 34 : 26;
    return L.divIcon({
        className: "zello-service-pin",
        html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
    });
}

export function MapContainer(props: MapContainerProps) {
    let mapElement: HTMLDivElement | undefined;
    let map: L.Map | undefined;
    let radiusCircle: L.Circle | undefined;
    let userMarker: L.CircleMarker | undefined;
    let serviceMarkers: L.Marker[] = [];

    const clearServiceMarkers = (): void => {
        serviceMarkers.forEach((marker) => marker.remove());
        serviceMarkers = [];
    };

    const renderServiceMarkers = (): void => {
        if (!map) return;
        clearServiceMarkers();

        props.services.forEach((service) => {
            const isActive = service.id === props.selectedServiceId;
            const marker = L.marker([service.latitude, service.longitude], {
                icon: buildPinIcon(getCategoryColor(service.category), isActive),
                keyboard: true,
                alt: `${service.name}, ${service.category}`,
            });
            marker.on("click", () => props.onSelectService(service));
            marker.addTo(map as L.Map);
            serviceMarkers.push(marker);
        });
    };

    const renderCenter = (): void => {
        if (!map) return;

        const centerLatLng: L.LatLngExpression = [props.center.latitude, props.center.longitude];
        map.setView(centerLatLng, map.getZoom() || DEFAULT_ZOOM);

        userMarker?.remove();
        userMarker = L.circleMarker(centerLatLng, {
            radius: 8,
            color: "#FFFFFF",
            weight: 2,
            fillColor: "#3B82F6",
            fillOpacity: 1,
        }).addTo(map);

        radiusCircle?.remove();
        radiusCircle = L.circle(centerLatLng, {
            radius: RADIUS_METERS,
            color: "#3B82F6",
            weight: 1,
            fillColor: "#3B82F6",
            fillOpacity: 0.08,
        }).addTo(map);
    };

    onMount(() => {
        if (!mapElement) return;

        map = L.map(mapElement, {
            center: [props.center.latitude, props.center.longitude],
            zoom: DEFAULT_ZOOM,
            scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        renderCenter();
        renderServiceMarkers();
    });

    createEffect(on(() => props.center, renderCenter, { defer: true }));
    createEffect(on(() => [props.services, props.selectedServiceId] as const, renderServiceMarkers, { defer: true }));

    onCleanup(() => {
        clearServiceMarkers();
        map?.remove();
        map = undefined;
    });

    return (
        <div
            ref={mapElement}
            role="application"
            aria-label="Mapa de estabelecimentos próximos, num raio de 10km"
            class="h-full w-full rounded-lg border border-border"
        />
    );
}
