import { Show } from "solid-js";
import { formatDistance, t } from "../../core/i18n";
import { SERVICES_SEARCH_RADIUS_KM } from "../../store/locationStore";
import type { EmptyStateReason } from "../../types/location";
import { MapPinIcon, SearchIcon } from "../Icons/Icons";
import { Button } from "../Widgets/Button";

export interface EmptyStateProps {
    reason: EmptyStateReason;
    onRetryLocation: () => void;
}

type VisibleReason = Exclude<EmptyStateReason, "idle">;

function toVisibleReason(reason: EmptyStateReason): VisibleReason | null {
    return reason === "idle" ? null : reason;
}

export function EmptyState(props: EmptyStateProps) {
    const copyFor = (reason: VisibleReason) => {
        if (reason === "no-permission") {
            return {
                title: t().location.emptyNoPermissionTitle,
                description: t().location.emptyNoPermissionDesc,
            };
        }
        if (reason === "no-results") {
            return {
                title: t().location.emptyNoResultsTitle,
                description: t().location.emptyNoResultsDesc(
                    formatDistance(SERVICES_SEARCH_RADIUS_KM, 0),
                ),
            };
        }
        return {
            title: t().location.emptyErrorTitle,
            description: t().location.emptyErrorDesc,
        };
    };

    return (
        <Show when={toVisibleReason(props.reason)}>
            {(reason) => (
                <div
                    role="status"
                    aria-live="polite"
                    class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card p-8 text-center sm:p-10"
                >
                    <div
                        class="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                        aria-hidden="true"
                    >
                        <Show
                            when={reason() === "no-results"}
                            fallback={<MapPinIcon class="size-6" />}
                        >
                            <SearchIcon class="size-6" />
                        </Show>
                    </div>
                    <div class="flex flex-col gap-1">
                        <h3 class="text-base font-semibold text-foreground">
                            {copyFor(reason()).title}
                        </h3>
                        <p class="max-w-sm text-sm text-muted-foreground">
                            {copyFor(reason()).description}
                        </p>
                    </div>
                    <Show when={reason() === "no-permission"}>
                        <Button variant="outline" onClick={props.onRetryLocation}>
                            {t().location.retryButton}
                        </Button>
                    </Show>
                </div>
            )}
        </Show>
    );
}
