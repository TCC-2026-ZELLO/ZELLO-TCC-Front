import { Show } from "solid-js";
import { DashboardSection } from "./DashboardSection";
import { ProgressBar } from "../Widgets/ProgressBar";
import type { VisibilityFunnel } from "../../types/dashboard";
import { formatPercent } from "../../utils/dashboard-format";

interface VisibilityFunnelCardProps {
    funnel: VisibilityFunnel;
}

// RF30 - CA3: visualizações da página pública vs agendamentos criados (taxa de conversão).
export function VisibilityFunnelCard(props: VisibilityFunnelCardProps) {
    const appointmentsBar = () => (props.funnel.views > 0 ? (props.funnel.appointments / props.funnel.views) * 100 : 0);

    return (
        <DashboardSection title="Funil de visibilidade">
            <div class="px-6 py-6 flex flex-col gap-5">
                <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground">Taxa de conversão</span>
                    <Show
                        when={props.funnel.conversionRate !== null}
                        fallback={<span class="text-base font-medium text-muted-foreground">sem visualizações no período</span>}
                    >
                        <span class="text-3xl font-bold text-foreground">{formatPercent(props.funnel.conversionRate ?? 0)}</span>
                    </Show>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Visualizações da página</span>
                        <span class="font-bold text-foreground">{props.funnel.views}</span>
                    </div>
                    <ProgressBar value={props.funnel.views > 0 ? 100 : 0} colorVar="--color-chart-2" />
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Agendamentos criados</span>
                        <span class="font-bold text-foreground">{props.funnel.appointments}</span>
                    </div>
                    <ProgressBar value={appointmentsBar()} colorVar="--color-success" />
                </div>

                <p class="text-xs text-muted-foreground">
                    Conta no máximo uma visualização por cliente por dia. Agendamentos considerados pela data de criação.
                </p>
            </div>
        </DashboardSection>
    );
}
