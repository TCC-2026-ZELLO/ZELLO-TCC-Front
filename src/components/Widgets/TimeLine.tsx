import { For, JSX } from "solid-js";

export interface TimelineItem {
    time: string;
    duration?: string;
    status: "success" | "warning" | "default";
    content: JSX.Element;
}

export function Timeline(props: { items: TimelineItem[] }) {
    return (
        <div class="flex flex-col">
            <For each={props.items}>
                {(item) => (
                    <div class="group flex gap-4 min-h-20">

                        <div class="w-12 flex flex-col items-end text-sm text-muted-foreground pt-1">
                            <strong class="text-foreground font-bold">{item.time}</strong>
                            {item.duration && <span>{item.duration}</span>}
                        </div>

                        <div class="flex flex-col items-center relative pt-2">
                            <div
                                class="w-2.5 h-2.5 rounded-full relative z-10"
                                classList={{
                                    "bg-success": item.status === "success",
                                    "bg-warning": item.status === "warning",
                                    "bg-secondary": item.status === "default" || !item.status
                                }}
                            />

                            <div class="absolute top-[18px] w-[2px] h-full bg-border z-0 group-last:hidden" />
                        </div>

                        <div class="flex-1 pb-6">
                            {item.content}
                        </div>

                    </div>
                )}
            </For>
        </div>
    );
}