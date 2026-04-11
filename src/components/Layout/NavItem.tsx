import {JSX, Show} from "solid-js";
import {A, useLocation} from "@solidjs/router";

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
            class="group relative flex items-center justify-between px-3 py-3 no-underline transition-all duration-200 rounded-full"
            classList={{
                "bg-white/15 text-white rounded-radius-full": isActive(),
                "bg-transparent text-muted-foreground hover:bg-white/10 hover:text-white": !isActive(),
            }}
        >
            <Show when={isActive()}>
                <div class="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r bg-white"/>
            </Show>

            <div class="flex items-center gap-3">
                <span
                    class="flex w-5 items-center justify-center transition-opacity"
                    classList={{"opacity-100": isActive(), "opacity-70 group-hover:opacity-100": !isActive()}}
                >
                  {props.icon}
                </span>
                <span
                    class="text-sm"
                    classList={{"font-semibold": isActive(), "font-medium": !isActive()}}
                >
                    {props.label}
                </span>
            </div>

            <Show when={props.badge}>
                <span
                    class="rounded-full px-2 py-[2px] text-[11px] font-bold text-white"
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