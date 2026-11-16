import { For, Show } from "solid-js";
import { DashboardSection } from "./DashboardSection";
import { ProgressBar } from "../Widgets/ProgressBar";
import type { RevenueByService } from "../../types/dashboard";
import { formatCurrency, formatPercent } from "../../utils/dashboard-format";

interface RevenueByServiceListProps {
    items: RevenueByService[];
}

// RF30 - CA1: receita estimada por tipo de serviço (já vem ordenada por receita desc).
export function RevenueByServiceList(props: RevenueByServiceListProps) {
    return (
        <DashboardSection title="Receita por serviço" aside={`${props.items.length} serviços`}>
            <Show
                when={props.items.length > 0}
                fallback={<div class="p-8 text-center text-muted-foreground">Nenhum atendimento concluído no período.</div>}
            >
                <div class="flex flex-col divide-y divide-border">
                    <For each={props.items}>
                        {(item) => (
                            <div class="px-6 py-4 flex flex-col gap-2 transition-colors hover:bg-muted/10">
                                <div class="flex items-center justify-between gap-4">
                                    <div class="flex min-w-0 flex-col">
                                        <span class="font-bold text-foreground truncate">{item.serviceName}</span>
                                        <span class="text-sm text-muted-foreground">
                                            {item.appointmentsCount} atendimento{item.appointmentsCount === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                    <div class="flex flex-col items-end shrink-0">
                                        <span class="font-bold text-foreground">{formatCurrency(item.revenue)}</span>
                                        <span class="text-xs text-muted-foreground">{formatPercent(item.sharePercent)}</span>
                                    </div>
                                </div>
                                <ProgressBar value={item.sharePercent} colorVar="--color-chart-2" />
                            </div>
                        )}
                    </For>
                </div>
            </Show>
        </DashboardSection>
    );
}
