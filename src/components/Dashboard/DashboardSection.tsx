import { JSX, Show } from "solid-js";
import { Card } from "../Widgets/Card";

interface DashboardSectionProps {
    title: string;
    aside?: JSX.Element;
    children: JSX.Element;
}

// Bloco com cabeçalho em faixa (mesmo padrão da lista do Catálogo).
export function DashboardSection(props: DashboardSectionProps) {
    return (
        <Card>
            <div class="flex flex-col">
                <div class="px-6 py-4 bg-muted/30 border-b border-border flex justify-between items-center gap-4">
                    <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {props.title}
                    </span>
                    <Show when={props.aside}>
                        <span class="text-xs text-muted-foreground">{props.aside}</span>
                    </Show>
                </div>
                {props.children}
            </div>
        </Card>
    );
}
