import { For, Show } from "solid-js";

export interface TabItem {
    label: string;
    value: string;
    badge?: string | number;
}

interface TabsProps {
    items: TabItem[];
    activeValue: string;
    onChange: (value: string) => void;
    class?: string;
}

export function Tabs(props: TabsProps) {
    return (
        <div class={`flex w-full ${props.class || ""}`}>
            <div class="flex w-full items-center rounded-lg border border-border bg-background p-1">
                <For each={props.items}>
                    {(item) => (
                        <button
                            type="button"
                            onClick={() => props.onChange(item.value)}
                            class="inline-flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border-none px-4 py-2 text-sm font-medium transition-all duration-150"
                            classList={{
                                "bg-card text-foreground shadow-sm": props.activeValue === item.value,
                                "bg-transparent text-muted-foreground hover:text-foreground": props.activeValue !== item.value,
                            }}
                        >
                            <span>{item.label}</span>

                            <Show when={item.badge}>
                                <span class="ml-1.5 rounded-full bg-secondary/50 px-1.5 text-xs opacity-80">
                                    {item.badge}
                                </span>
                            </Show>
                        </button>
                    )}
                </For>
            </div>
        </div>
    );
}