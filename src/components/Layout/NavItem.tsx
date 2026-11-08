import { A, useLocation } from "@solidjs/router";
import { JSX, Show } from "solid-js";
import { closeMobileSidebar, isSidebarCollapsed } from "../../store/appState";

interface NavItemProps {
    label: string;
    icon: JSX.Element;
    href?: string;
    badge?: string | number;
    active?: boolean;
}

export function NavItem(props: NavItemProps) {
    const location = useLocation();
    const isActive = () => props.active ?? location.pathname === props.href;

    return (
        <A
            href={props.href || "#"}
            onClick={() => closeMobileSidebar()}
            title={props.label}
            class={`group relative flex items-center rounded-xl no-underline transition-all duration-200 px-3 py-3 w-full ${
                isSidebarCollapsed()
                    ? "md:h-11 md:w-11 md:shrink-0 md:justify-center md:p-0"
                    : "justify-between"
            } ${
                isActive()
                    ? "bg-white/18 text-sidebar-foreground font-semibold"
                    : "bg-transparent text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground"
            }`}
        >
            <Show when={isActive()}>
                <div class="absolute top-1/4 left-0 h-1/2 w-[3px] rounded-r bg-primary-foreground md:bg-white" />
            </Show>

            <div class="flex items-center gap-3">
                <span
                    class="flex w-5 shrink-0 items-center justify-center transition-opacity"
                    classList={{
                        "opacity-100": isActive(),
                        "opacity-75 group-hover:opacity-100": !isActive(),
                    }}
                >
                    {props.icon}
                </span>

                <span
                    class={`whitespace-nowrap text-sm ${
                        isSidebarCollapsed() ? "md:hidden" : ""
                    }`}
                >
                    {props.label}
                </span>
            </div>

            <Show when={props.badge}>
                <span
                    class={`shrink-0 rounded-full px-2 py-[2px] text-[11px] font-bold text-white ${
                        isSidebarCollapsed() ? "md:hidden" : ""
                    } ${isActive() ? "bg-cliente" : "bg-white/15"}`}
                >
                    {props.badge}
                </span>
            </Show>
        </A>
    );
}