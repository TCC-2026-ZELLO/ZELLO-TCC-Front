import { For, Show } from "solid-js";
import { DashboardSection } from "./DashboardSection";
import { Avatar } from "../Widgets/Avatar";
import { Badge } from "../Widgets/Badge";
import type { TeamMemberPerformance } from "../../types/dashboard";
import { formatCurrency, initialsOf } from "../../utils/dashboard-format";

interface TeamPerformanceListProps {
    team: TeamMemberPerformance[];
}

// RF30 - CA2: performance da equipe (inclui profissionais sem atendimento no período).
export function TeamPerformanceList(props: TeamPerformanceListProps) {
    return (
        <DashboardSection title="Performance da equipe" aside={`${props.team.length} profissionais`}>
            <Show
                when={props.team.length > 0}
                fallback={<div class="p-8 text-center text-muted-foreground">Nenhum profissional vinculado ao estabelecimento.</div>}
            >
                <div class="flex flex-col divide-y divide-border">
                    <For each={props.team}>
                        {(member) => (
                            <div class="px-6 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-muted/10">
                                <div class="flex min-w-0 items-center gap-3">
                                    <Avatar fallbackInitials={initialsOf(member.name)} size="md" />
                                    <div class="flex min-w-0 flex-col">
                                        <span class="font-bold text-foreground truncate">{member.name}</span>
                                        <span class="text-sm text-muted-foreground">
                                            {member.appointmentsCount} atendimento{member.appointmentsCount === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                </div>
                                <Show
                                    when={member.appointmentsCount > 0}
                                    fallback={<Badge>Sem atendimentos</Badge>}
                                >
                                    <span class="font-bold text-foreground shrink-0">{formatCurrency(member.revenue)}</span>
                                </Show>
                            </div>
                        )}
                    </For>
                </div>
            </Show>
        </DashboardSection>
    );
}
