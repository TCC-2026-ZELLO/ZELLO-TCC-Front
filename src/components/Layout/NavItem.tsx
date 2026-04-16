import { JSX, Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";

import { isSidebarCollapsed } from "~/store/appState";

interface NavItemProps {
    label: string;
    icon: JSX.Element;
    href?: string;
    badge?: string | number;
    active?: boolean;
}

export function NavItem(props: NavItemProps) {
    const location = useLocation();
    const isActive = () => location.pathname === props.href;

    return (
        <A
            href={props.href || "#"}
            class="group relative flex items-center no-underline transition-all duration-200 rounded-full"
            classList={{
                "justify-between px-3 py-3 w-full": !isSidebarCollapsed(),
                "justify-center w-11 h-11 shrink-0": isSidebarCollapsed(), // Formato bolinha quando colapsado
                "bg-white/15 text-white": isActive(),
                "bg-transparent text-muted-foreground hover:bg-white/10 hover:text-white": !isActive(),
            }}
        >
            <Show when={isActive()}>
                <div class="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r bg-white" />
            </Show>

            <div class="flex items-center gap-3">
                <span
                    class="flex w-5 items-center justify-center transition-opacity shrink-0"
                    classList={{ "opacity-100": isActive(), "opacity-70 group-hover:opacity-100": !isActive() }}
                >
                    {props.icon}
                </span>

                <Show when={!isSidebarCollapsed()}>
                    <span
                        class="text-sm whitespace-nowrap"
                        classList={{ "font-semibold": isActive(), "font-medium": !isActive() }}
                    >
                        {props.label}
                    </span>
                </Show>
            </div>

            <Show when={props.badge && !isSidebarCollapsed()}>
                <span
                    class="rounded-full px-2 py-[2px] text-[11px] font-bold text-white shrink-0"
                    classList={{
                        "bg-cliente": isActive(),
                        "bg-white/10": !isActive()
                    }}
                >
                    {props.badge}
                </span>
            </Show>
        </A>
    );
}