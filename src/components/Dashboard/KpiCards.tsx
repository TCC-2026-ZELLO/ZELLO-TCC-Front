import { Match, Switch } from "solid-js";
import { Badge } from "../Widgets/Badge";
import { StatCard } from "./StatCard";
import { BriefcaseIcon, ChartIcon, CheckCircleIcon, TrendingDownIcon, TrendingUpIcon } from "../Icons/Icons";
import type { DashboardPeriod, RevenueSummary } from "../../types/dashboard";
import { formatCurrency, formatIsoDate, formatVariation, variationTrend, VariationTrend } from "../../utils/dashboard-format";

const TREND_BADGE: Record<VariationTrend, { label: string; variant: "success" | "error" | "default" }> = {
    up: { label: "Crescimento", variant: "success" },
    down: { label: "Queda", variant: "error" },
    flat: { label: "Estável", variant: "default" },
    none: { label: "sem base de comparação", variant: "default" },
};

interface KpiCardsProps {
    revenue: RevenueSummary;
    period: DashboardPeriod;
}

// RF30 - CA1 (faturamento global) + CA4 (variação vs período anterior).
export function KpiCards(props: KpiCardsProps) {
    const trend = () => variationTrend(props.revenue.variationPercent);
    const previousLabel = () =>
        `Anterior: ${formatCurrency(props.revenue.previousTotal)} (${formatIsoDate(props.period.previousFrom)} – ${formatIsoDate(props.period.previousTo)})`;

    return (
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard icon={<ChartIcon />} label="Receita estimada" value={formatCurrency(props.revenue.total)} />

            <StatCard
                icon={
                    <Switch fallback={<ChartIcon />}>
                        <Match when={trend() === "up"}><TrendingUpIcon /></Match>
                        <Match when={trend() === "down"}><TrendingDownIcon /></Match>
                    </Switch>
                }
                label="Variação vs período anterior"
                value={trend() === "none" ? "—" : formatVariation(props.revenue.variationPercent)}
                hint={
                    <div class="flex flex-col items-start gap-2">
                        <Badge variant={TREND_BADGE[trend()].variant} data-testid="variation-badge">
                            {TREND_BADGE[trend()].label}
                        </Badge>
                        <span>{previousLabel()}</span>
                    </div>
                }
            />

            <StatCard icon={<CheckCircleIcon />} label="Atendimentos concluídos" value={String(props.revenue.completedCount)} />

            <StatCard icon={<BriefcaseIcon />} label="Ticket médio" value={formatCurrency(props.revenue.averageTicket)} />
        </div>
    );
}
