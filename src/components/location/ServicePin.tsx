import {
    formatDistance,
    formatDistanceLong,
    localizeDomain,
    t,
} from "../../core/i18n";
import type { ServiceLocation } from "../../types/location";
import { MapPinIcon } from "../Icons/Icons";
import { Badge } from "../Widgets/Badge";
import { Rating } from "../Widgets/Rating";

export interface ServicePinProps {
    service: ServiceLocation;
    isActive: boolean;
    onSelect: (service: ServiceLocation) => void;
}

export function ServicePin(props: ServicePinProps) {
    const localizedCategory = () =>
        localizeDomain.category(props.service.category);
    const localizedServices = () =>
        localizeDomain.serviceList(props.service.services);

    return (
        <button
            type="button"
            onClick={() => props.onSelect(props.service)}
            aria-pressed={props.isActive}
            aria-label={t().location.pinAria(
                props.service.name,
                localizedCategory(),
                formatDistanceLong(props.service.distanceKm),
            )}
            class="flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            classList={{
                "border-primary bg-secondary": props.isActive,
                "border-border bg-card hover:bg-secondary/60": !props.isActive,
            }}
        >
            <div
                class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-hidden="true"
            >
                <MapPinIcon class="size-4" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-semibold text-foreground">
                        {props.service.name}
                    </span>
                    <span class="shrink-0 text-xs font-medium text-muted-foreground">
                        {formatDistance(props.service.distanceKm)}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <Rating value={props.service.rating} />
                    <Badge>{localizedCategory()}</Badge>
                </div>
                <p class="truncate text-xs text-muted-foreground">
                    {localizedServices()}
                </p>
            </div>
        </button>
    );
}
