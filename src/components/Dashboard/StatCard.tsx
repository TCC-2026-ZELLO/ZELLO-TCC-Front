import { JSX, Show } from "solid-js";
import { Card } from "../Widgets/Card";

interface StatCardProps {
    icon: JSX.Element;
    label: string;
    value: string;
    hint?: JSX.Element;
}

// Card de indicador no mesmo padrão do resumo do Catálogo (ícone circular + valor + legenda).
export function StatCard(props: StatCardProps) {
    return (
        <Card>
            <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    {props.icon}
                </div>
                <div class="flex min-w-0 flex-col">
                    <div class="text-2xl font-bold text-foreground truncate">{props.value}</div>
                    <div class="text-sm text-muted-foreground">{props.label}</div>
                </div>
            </div>
            <Show when={props.hint}>
                <div class="text-xs text-muted-foreground">{props.hint}</div>
            </Show>
        </Card>
    );
}
