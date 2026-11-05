import { createMemo, For, Show } from "solid-js";
import { DashboardSection } from "./DashboardSection";
import type { RevenueTimelinePoint } from "../../types/dashboard";
import { formatCurrency, formatIsoDate, formatShortDate } from "../../utils/dashboard-format";

interface RevenueTimelineChartProps {
    timeline: RevenueTimelinePoint[];
}

// RF30 - CA1: evolução diária da receita estimada (barras em CSS, sem lib de gráfico).
export function RevenueTimelineChart(props: RevenueTimelineChartProps) {
    const maxRevenue = createMemo(() => props.timeline.reduce((max, point) => Math.max(max, point.revenue), 0));
    const edgeLabel = (point: RevenueTimelinePoint | undefined) => (point ? formatShortDate(point.date) : "");
    const firstLabel = () => edgeLabel(props.timeline[0]);
    const lastLabel = () => edgeLabel(props.timeline[props.timeline.length - 1]);

    const barHeight = (revenue: number) => {
        const max = maxRevenue();
        if (max <= 0 || revenue <= 0) return "0%";
        return `${Math.max(2, (revenue / max) * 100)}%`;
    };

    return (
        <DashboardSection title="Receita estimada por dia" aside={`Pico: ${formatCurrency(maxRevenue())}`}>
            <Show
                when={maxRevenue() > 0}
                fallback={<div class="p-8 text-center text-muted-foreground">Nenhuma receita registrada no período.</div>}
            >
                <div class="px-6 py-6 flex flex-col gap-3">
                    <div class="flex h-48 items-end gap-px" role="img" aria-label="Gráfico de receita estimada por dia">
                        <For each={props.timeline}>
                            {(point) => (
                                <div
                                    class="group relative flex h-full min-w-0 flex-1 items-end"
                                    title={`${formatIsoDate(point.date)}: ${formatCurrency(point.revenue)}`}
                                >
                                    <div
                                        class="w-full rounded-t-sm bg-chart-2 transition-[height] duration-500 ease-out group-hover:opacity-80"
                                        style={{ height: barHeight(point.revenue) }}
                                    />
                                </div>
                            )}
                        </For>
                    </div>
                    <div class="flex justify-between text-xs text-muted-foreground">
                        <span>{firstLabel()}</span>
                        <span>{lastLabel()}</span>
                    </div>
                </div>
            </Show>
        </DashboardSection>
    );
}
