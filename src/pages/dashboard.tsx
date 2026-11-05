import { createMemo, createResource, createSignal, Match, Show, Switch } from "solid-js";
import { Card } from "../components/Widgets/Card";
import { Button } from "../components/Widgets/Button";
import { PeriodSelector } from "../components/Dashboard/PeriodSelector";
import { KpiCards } from "../components/Dashboard/KpiCards";
import { RevenueTimelineChart } from "../components/Dashboard/RevenueTimelineChart";
import { RevenueByServiceList } from "../components/Dashboard/RevenueByServiceList";
import { TeamPerformanceList } from "../components/Dashboard/TeamPerformanceList";
import { VisibilityFunnelCard } from "../components/Dashboard/VisibilityFunnelCard";
import { NoShowCard } from "../components/Dashboard/NoShowCard";
import { dashboardService } from "../services/dashboard.service";
import { activeBusiness } from "../store/appState";
import type { DashboardQuery } from "../types/dashboard";
import {
    extractErrorMessage,
    formatIsoDate,
    PeriodPresetId,
    PeriodRange,
    resolvePreset,
    validatePeriod,
} from "../utils/dashboard-format";

// RF30 - Dashboards de faturamento do estabelecimento (gestor).
export default function DashboardPage() {
    const [activePreset, setActivePreset] = createSignal<PeriodPresetId | null>("currentMonth");
    const [range, setRange] = createSignal<PeriodRange>(resolvePreset("currentMonth"));

    const periodError = createMemo(() => validatePeriod(range()));

    // Fonte do resource: só dispara com empresa ativa e período válido.
    const query = createMemo<DashboardQuery | false>(() => {
        const businessId = activeBusiness()?.businessId;
        if (!businessId || periodError()) return false;
        const { from, to } = range();
        return { businessId, from, to };
    }, false, {
        equals: (prev, next) =>
            prev === next ||
            (prev !== false && next !== false &&
                prev.businessId === next.businessId && prev.from === next.from && prev.to === next.to),
    });

    const [dashboard, { refetch }] = createResource(query, dashboardService.getBusinessDashboard);
    const errorMessage = createMemo(() => (dashboard.error ? extractErrorMessage(dashboard.error) : null));

    const handlePresetSelect = (preset: PeriodPresetId) => {
        setActivePreset(preset);
        setRange(resolvePreset(preset));
    };

    const handleRangeChange = (next: PeriodRange) => {
        setActivePreset(null);
        setRange(next);
    };

    return (
        <div class="flex flex-col gap-8 p-8 animate-in fade-in duration-300">
            {/* --- HEADER --- */}
            <header class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
                <p class="text-muted-foreground">
                    Gerenciando: <span class="font-medium text-foreground">{activeBusiness()?.name || "Carregando..."}</span>
                </p>
            </header>

            {/* --- PERÍODO --- */}
            <PeriodSelector
                range={range()}
                activePreset={activePreset()}
                error={periodError()}
                onPresetSelect={handlePresetSelect}
                onRangeChange={handleRangeChange}
            />

            <Switch>
                <Match when={!activeBusiness()?.businessId}>
                    <Card>
                        <div class="p-8 text-center text-muted-foreground">
                            Selecione uma empresa para visualizar o dashboard.
                        </div>
                    </Card>
                </Match>

                <Match when={errorMessage()}>
                    <Card>
                        <div class="p-8 flex flex-col items-center gap-4 text-center">
                            <span class="text-error">{errorMessage()}</span>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>
                                Tentar novamente
                            </Button>
                        </div>
                    </Card>
                </Match>

                <Match when={dashboard.loading && !dashboard.latest}>
                    <Card>
                        <div class="p-8 text-center text-muted-foreground animate-pulse">
                            Carregando indicadores do período...
                        </div>
                    </Card>
                </Match>

                <Match when={dashboard.latest}>
                    {(data) => (
                        <div class="flex flex-col gap-8" classList={{ "opacity-60 transition-opacity": dashboard.loading }}>
                            <p class="text-sm text-muted-foreground -mt-4">
                                Valores de receita estimada com base nos atendimentos concluídos entre{" "}
                                <span class="font-medium text-foreground">{formatIsoDate(data().period.from)}</span> e{" "}
                                <span class="font-medium text-foreground">{formatIsoDate(data().period.to)}</span>.
                            </p>

                            {/* CA1 + CA4 */}
                            <KpiCards revenue={data().revenue} period={data().period} />

                            {/* CA1 */}
                            <RevenueTimelineChart timeline={data().revenue.timeline} />

                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <RevenueByServiceList items={data().revenue.byService} />
                                {/* CA2 */}
                                <TeamPerformanceList team={data().team} />
                            </div>

                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* CA3 */}
                                <VisibilityFunnelCard funnel={data().visibility} />
                                {/* CA5 */}
                                <NoShowCard noShows={data().noShows} />
                            </div>
                        </div>
                    )}
                </Match>
            </Switch>
        </div>
    );
}
