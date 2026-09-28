import { Rating } from "../Widgets/Rating";
import { Badge } from "../Widgets/Badge";
import { MapPinIcon } from "../Icons/Icons";
import type { ServiceLocation } from "../../types/location";

export interface ServicePinProps {
    service: ServiceLocation;
    isActive: boolean;
    onSelect: (service: ServiceLocation) => void;
}

/**
 * Linha de resultado na lista lateral. Como o `leaflet` usado aqui é o
 * vanilla (não `react-leaflet` — incompatível com o `jsxImportSource` do
 * SolidJS), os marcadores do mapa são desenhados imperativamente em
 * `MapContainer`; este componente é a contraparte declarativa que fica na
 * lista, mantendo o mesmo item de dados (`ServiceLocation`) e o mesmo
 * callback de seleção do pin correspondente no mapa.
 */
export function ServicePin(props: ServicePinProps) {
    return (
        <button
            type="button"
            onClick={() => props.onSelect(props.service)}
            aria-pressed={props.isActive}
            aria-label={`${props.service.name}, ${props.service.category}, a ${props.service.distanceKm.toFixed(1)} quilômetros`}
            class="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            classList={{
                "border-primary bg-secondary": props.isActive,
                "border-border bg-card hover:bg-secondary/60": !props.isActive,
            }}
        >
            <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                <MapPinIcon class="size-4" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-semibold text-foreground">{props.service.name}</span>
                    <span class="shrink-0 text-xs font-medium text-muted-foreground">
                        {props.service.distanceKm.toFixed(1)} km
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <Rating value={props.service.rating} />
                    <Badge>{props.service.category}</Badge>
                </div>
                <p class="truncate text-xs text-muted-foreground">{props.service.services}</p>
            </div>
        </button>
    );
}
