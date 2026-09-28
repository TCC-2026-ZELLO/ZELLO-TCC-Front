import { Show } from "solid-js";
import { Button } from "../Widgets/Button";
import { MapPinIcon, SearchIcon } from "../Icons/Icons";
import type { EmptyStateReason } from "../../types/location";

export interface EmptyStateProps {
    reason: EmptyStateReason;
    onRetryLocation: () => void;
}

type VisibleReason = Exclude<EmptyStateReason, "idle">;

interface EmptyStateCopy {
    title: string;
    description: string;
}

const COPY: Record<VisibleReason, EmptyStateCopy> = {
    "no-permission": {
        title: "Precisamos da sua localização",
        description:
            "Permita o acesso à localização no navegador ou busque um endereço manualmente para encontrar estabelecimentos próximos.",
    },
    "no-results": {
        title: "Nenhum estabelecimento encontrado",
        description: "Não encontramos estabelecimentos no raio de 10km desta localização. Tente buscar outro endereço.",
    },
    error: {
        title: "Não foi possível buscar agora",
        description: "Ocorreu um erro ao buscar estabelecimentos próximos. Tente novamente em instantes.",
    },
};

function toVisibleReason(reason: EmptyStateReason): VisibleReason | null {
    return reason === "idle" ? null : reason;
}

export function EmptyState(props: EmptyStateProps) {
    return (
        <Show when={toVisibleReason(props.reason)}>
            {(reason) => {
                const copy = () => COPY[reason()];

                return (
                    <div
                        role="status"
                        aria-live="polite"
                        class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card p-10 text-center"
                    >
                        <div class="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground" aria-hidden="true">
                            <Show when={reason() === "no-results"} fallback={<MapPinIcon class="size-6" />}>
                                <SearchIcon class="size-6" />
                            </Show>
                        </div>
                        <div class="flex flex-col gap-1">
                            <h3 class="text-base font-semibold text-foreground">{copy().title}</h3>
                            <p class="max-w-sm text-sm text-muted-foreground">{copy().description}</p>
                        </div>
                        <Show when={reason() === "no-permission"}>
                            <Button variant="outline" onClick={props.onRetryLocation}>
                                Tentar novamente
                            </Button>
                        </Show>
                    </div>
                );
            }}
        </Show>
    );
}
