import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { NavItem } from "~/components/Layout/NavItem";
import { ProfileSwitcher } from "~/components/Layout/ProfileSwitcher";

import {
    accountRole,
    isDark,
    t,
    idioma,
    isSidebarCollapsed,
    isMounted,
} from "~/store/appState";

import {
    ZelloIcon,
    HomeIcon,
    PlusIcon,
    CalendarIcon,
    HeartIcon,
    RibbonIcon,
    SettingsIcon,
    LogoutIcon,
} from "~/components/Icons/Icons";
import { logout } from "~/services/auth.service";

export function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login");
        }
    };

    return (
        <aside
            class="flex flex-col transition-all duration-300 border-r overflow-hidden"
            classList={{
                "w-[288px]": !isSidebarCollapsed(),
                "w-[80px]": isSidebarCollapsed(),
                "bg-sidebar text-white border-white/10": isDark(),
                "bg-[#1A2B42] text-white border-none": !isDark()
            }}
        >
            <div class="p-6 flex items-center gap-3" classList={{ "justify-center px-0": isSidebarCollapsed() }}>
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white shrink-0">
                    <ZelloIcon/>
                </div>
                <Show when={!isSidebarCollapsed()}>
                    <span class="font-semibold text-xl whitespace-nowrap">Zello</span>
                </Show>
            </div>

            <div class="px-4 pb-6" classList={{ "px-2": isSidebarCollapsed() }}>
                <Show when={isMounted()} fallback={<div class="h-12 w-full animate-pulse bg-white/5 rounded-xl" />}>
                    <ProfileSwitcher variant="sidebar" isCollapsed={isSidebarCollapsed()} />
                </Show>
            </div>

            <nav
                class="flex-1 px-4 flex flex-col gap-3 overflow-y-auto overflow-x-hidden"
                classList={{ "px-2 items-center": isSidebarCollapsed() }}
            >
                <Show when={isMounted()}>
                    <Show when={accountRole() === "cliente"}>
                        <NavItem label={t().sidebar.nav.home} icon={<HomeIcon/>} href="/explore" />
                    </Show>

                    <Show when={accountRole() === "profissional"}>
                        <NavItem label={t().sidebar.nav.portfolio} icon={<HomeIcon/>} href="/professional_settings" />
                    </Show>

                    <Show when={accountRole() === "estabelecimento"}>
                        <NavItem label={t().sidebar.nav.team_schedule} icon={<CalendarIcon/>} href="/team_schedule" />
                        <NavItem label={t().sidebar.nav.catalog} icon={<HeartIcon/>} href="/catalog" />
                        <NavItem label={t().sidebar.nav.professionals} icon={<PlusIcon/>} href="/professionals" />
                        <NavItem label={t().sidebar.nav.business} icon={<HomeIcon/>} href="/business_settings" />
                    </Show>
                </Show>

                <div style={{ "margin-top": "var(--space-6)" }}>
                    <Show when={!isSidebarCollapsed()}>
                        <div style={{
                            "font-size": "11px",
                            "font-weight": "var(--font-weight-semibold)",
                            color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF",
                            "letter-spacing": "1px",
                            "margin-bottom": "var(--space-2)",
                            "padding-left": "var(--space-3)",
                            "text-transform": "uppercase",
                            "white-space": "nowrap"
                        }}>
                            {t().sidebar.nav.account}
                        </div>
                    </Show>

                    <Show when={isSidebarCollapsed()}>
                        <div class="h-px w-6 mx-auto bg-white/10 mb-3 mt-2"></div>
                    </Show>

                    <NavItem label={t().sidebar.nav.settings} icon={<SettingsIcon/>} href="/configuracoes" />
                </div>
            </nav>

            <div class="p-4" classList={{ "px-2": isSidebarCollapsed() }}>
                <div
                    onClick={handleLogout}
                    class="flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-white/5 rounded-xl hover:text-red-400"
                    classList={{ "justify-center": isSidebarCollapsed() }}
                    style={{ color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF" }}
                >
                    <span class="shrink-0"> <LogoutIcon/> </span>
                    <Show when={!isSidebarCollapsed()}>
                        <span style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-medium)", "white-space": "nowrap" }}>
                            {t().sidebar.nav.logout}
                        </span>
                    </Show>
                </div>
            </div>
        </aside>
    );
}