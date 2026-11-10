import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { t } from "../../core/i18n";
import { logout } from "../../services/auth.service";
import {
    accountRole,
    closeMobileSidebar,
    isMobileSidebarOpen,
    isMounted,
    isSidebarCollapsed,
} from "../../store/appState";
import {
    CalendarIcon,
    HeartIcon,
    HomeIcon,
    LogoutIcon,
    MapPinIcon,
    PlusIcon,
    SettingsIcon,
    XIcon,
    ZelloIcon,
} from "../Icons/Icons";
import { NavItem } from "./NavItem";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        closeMobileSidebar();
        try {
            await logout();
        } finally {
            navigate("/login");
        }
    };

    return (
        <>
            <Show when={isMobileSidebarOpen()}>
                <div
                    class="fixed inset-0 z-40 bg-overlay backdrop-blur-xs md:hidden"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            </Show>

            <aside
                class={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 md:static md:z-auto ${
                    isMobileSidebarOpen() ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                } ${isSidebarCollapsed() ? "w-[280px] md:w-[80px]" : "w-[280px] md:w-[288px]"}`}
            >
                <div
                    class={`flex items-center justify-between gap-3 p-5 ${
                        isSidebarCollapsed() ? "md:justify-center md:px-2" : ""
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sidebar-foreground">
                            <ZelloIcon />
                        </div>
                        <span
                            class={`whitespace-nowrap text-xl font-semibold ${
                                isSidebarCollapsed() ? "md:hidden" : ""
                            }`}
                        >
                            {t().sidebar.brand}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={closeMobileSidebar}
                        aria-label={t().common.close}
                        class="cursor-pointer rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground md:hidden"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div
                    class={`px-4 pb-5 ${isSidebarCollapsed() ? "md:px-2" : ""}`}
                >
                    <Show
                        when={isMounted()}
                        fallback={
                            <div class="h-12 w-full animate-pulse rounded-xl bg-white/5" />
                        }
                    >
                        <ProfileSwitcher
                            variant="sidebar"
                            isCollapsed={isSidebarCollapsed()}
                        />
                    </Show>
                </div>

                <nav
                    aria-label="Navegação principal"
                    class={`flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-4 ${
                        isSidebarCollapsed() ? "md:items-center md:px-2" : ""
                    }`}
                >
                    <Show when={isMounted()}>
                        <Show when={accountRole() === "cliente"}>
                            <NavItem
                                label={t().sidebar.nav.home}
                                icon={<HomeIcon />}
                                href="/explore"
                            />
                            <NavItem
                                label={t().sidebar.nav.map}
                                icon={<MapPinIcon />}
                                href="/mapa"
                            />
                            <NavItem
                                label={t().sidebar.nav.appointments}
                                icon={<CalendarIcon />}
                                href="/agendamentos"
                            />
                        </Show>

                        <Show when={accountRole() === "profissional"}>
                            <NavItem
                                label={t().sidebar.nav.portfolio}
                                icon={<HomeIcon />}
                                href="/professional_settings"
                            />
                        </Show>

                        <Show when={accountRole() === "estabelecimento"}>
                            <NavItem
                                label={t().sidebar.nav.team_schedule}
                                icon={<CalendarIcon />}
                                href="/team_schedule"
                            />
                            <NavItem
                                label={t().sidebar.nav.catalog}
                                icon={<HeartIcon />}
                                href="/catalog"
                            />
                            <NavItem
                                label={t().sidebar.nav.professionals}
                                icon={<PlusIcon />}
                                href="/professionals"
                            />
                            <NavItem
                                label={t().sidebar.nav.business}
                                icon={<HomeIcon />}
                                href="/business_settings"
                            />
                        </Show>
                    </Show>

                    <div class="mt-6 w-full">
                        <div
                            class={`mb-2 pl-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60 ${
                                isSidebarCollapsed() ? "md:hidden" : ""
                            }`}
                        >
                            {t().sidebar.nav.account}
                        </div>

                        <Show when={isSidebarCollapsed()}>
                            <div class="mx-auto my-2 hidden h-px w-6 bg-white/15 md:block" />
                        </Show>

                        <NavItem
                            label={t().sidebar.nav.settings}
                            icon={<SettingsIcon />}
                            href="/configuracoes"
                        />
                    </div>
                </nav>

                <div class={`p-4 ${isSidebarCollapsed() ? "md:px-2" : ""}`}>
                    <button
                        type="button"
                        aria-label={t().sidebar.nav.logout}
                        onClick={handleLogout}
                        class={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-sidebar-foreground/75 transition-colors hover:bg-white/10 hover:text-error ${
                            isSidebarCollapsed() ? "md:justify-center" : ""
                        }`}
                    >
                        <span class="shrink-0" aria-hidden="true">
                            <LogoutIcon />
                        </span>
                        <span
                            class={`whitespace-nowrap text-sm font-medium ${
                                isSidebarCollapsed() ? "md:hidden" : ""
                            }`}
                        >
                            {t().sidebar.nav.logout}
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}