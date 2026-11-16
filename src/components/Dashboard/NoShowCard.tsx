import { Show } from "solid-js";
import { DashboardSection } from "./DashboardSection";
import { AlertIcon } from "../Icons/Icons";
import type { NoShowSummary } from "../../types/dashboard";
import { formatCurrency, formatPercent } from "../../utils/dashboard-format";

interface NoShowCardProps {
    noShows: NoShowSummary;
}

// RF30 - CA5: perda de receita estimada com faltas e cancelamentos não justificados.
export function NoShowCard(props: NoShowCardProps) {
    return (
        <DashboardSection title="Faltas e cancelamentos">
            <div class="px-6 py-6 flex flex-col gap-5">
                <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                        <AlertIcon />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-2xl font-bold text-error">{formatCurrency(props.noShows.lostRevenue)}</span>
                        <span class="text-sm text-muted-foreground">
                            Perda estimada
                            <Show when={props.noShows.lostRevenuePercentOfPotential !== null}>
                                {" "}· {formatPercent(props.noShows.lostRevenuePercentOfPotential ?? 0)} do potencial
                            </Show>
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="rounded-lg border border-border p-4 flex flex-col">
                        <span class="text-2xl font-bold text-foreground">{props.noShows.noShowCount}</span>
                        <span class="text-sm text-muted-foreground">Não comparecimentos</span>
                    </div>
                    <div class="rounded-lg border border-border p-4 flex flex-col">
                        <span class="text-2xl font-bold text-foreground">{props.noShows.unjustifiedCancellationCount}</span>
                        <span class="text-sm text-muted-foreground">Cancelamentos não justificados</span>
                    </div>
                </div>

                <p class="text-xs text-muted-foreground">
                    Atendimentos confirmados que não forem marcados como concluídos viram falta automaticamente
                    60 minutos após o término. Conclua os atendimentos para manter este número correto.
                </p>
            </div>
        </DashboardSection>
    );
}
