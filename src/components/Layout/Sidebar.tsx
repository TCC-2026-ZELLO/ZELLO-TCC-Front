import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Avatar } from "~/components/Widgets/Avatar";
import { NavItem } from "~/components/Layout/NavItem";

import {
    accountRole,
    isDark,
    t,
    idioma,
    isSidebarCollapsed,
    currentUser,
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
    ChevronDownIcon
} from "~/components/Icons/Icons";
import {logout, logoutAuth} from "~/services/auth.service";

export function Sidebar() {
    const navigate = useNavigate();

    const getInitials = (name?: string) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

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
            {/* 1. Logo */}
            <div class="p-6 flex items-center gap-3" classList={{ "justify-center px-0": isSidebarCollapsed() }}>
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white shrink-0">
                    <ZelloIcon/>
                </div>
                <Show when={!isSidebarCollapsed()}>
                    <span class="font-semibold text-xl whitespace-nowrap">Zello</span>
                </Show>
            </div>

            {/* 2. Perfil */}
            <div class="px-4 pb-6" classList={{ "px-2": isSidebarCollapsed() }}>
                <div
                    class="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                    classList={{ "justify-center p-2": isSidebarCollapsed() }}
                >
                    <Avatar size="md" fallbackInitials={getInitials(currentUser()?.name)} />

                    <Show when={!isSidebarCollapsed()}>
                        <div class="flex-1 overflow-hidden whitespace-nowrap">
                            <div class="font-semibold text-sm truncate">
                                {currentUser()?.name || "Visitante"}
                            </div>
                            <div class="text-xs text-gray-400 truncate">
                                {accountRole() === "cliente" ? t().sidebar.clientTier : t().sidebar.profTier}
                            </div>
                        </div>
                        <span class="text-gray-400 shrink-0"><ChevronDownIcon/></span>
                    </Show>
                </div>
            </div>

            {/* 3. Navegação Específica por Perfil */}
            <nav
                class="flex-1 px-4 flex flex-col gap-3 overflow-y-auto overflow-x-hidden"
                classList={{ "px-2 items-center": isSidebarCollapsed() }}
            >
                <Show when={accountRole() === "cliente"}>
                    <NavItem label={t().sidebar.nav.home} icon={<HomeIcon/>} href="/explore" />
                    <NavItem label={t().sidebar.nav.newBooking} icon={<PlusIcon/>} href="/nova-reserva" />
                    <NavItem label={t().sidebar.nav.myBookings} icon={<CalendarIcon/>} badge={2} href="/agendamentos" />
                    <NavItem label={t().sidebar.nav.favorites} icon={<HeartIcon/>} href="/favoritos" />
                    <NavItem label={t().sidebar.nav.loyalty} icon={<RibbonIcon/>} badge={idioma() === "PT" ? "Ouro" : "Gold"} href="/fidelidade" />
                </Show>

                <Show when={accountRole() === "profissional"}>
                    <NavItem label={t().sidebar.nav.dashboard} icon={<HomeIcon/>} href="/explore" />
                    <NavItem label={t().sidebar.nav.mySchedule} icon={<CalendarIcon/>} href="/agenda" />
                    <NavItem label={t().sidebar.nav.clients} icon={<HeartIcon/>} href="/clientes" />
                    <NavItem label={t().sidebar.nav.servicesPortfolio} icon={<PlusIcon/>} href="/portfolio" />
                </Show>

                {/* 4. Configurações da Conta */}
                <div style={{ "margin-top": "var(--space-6)" }}>
                    <Show when={!isSidebarCollapsed()}>
                        <div style={{ "font-size": "11px", "font-weight": "var(--font-weight-semibold)", color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF", "letter-spacing": "1px", "margin-bottom": "var(--space-2)", "padding-left": "var(--space-3)", "text-transform": "uppercase", "white-space": "nowrap" }}>
                            {t().sidebar.nav.account}
                        </div>
                    </Show>

                    <Show when={isSidebarCollapsed()}>
                        <div class="h-px w-6 mx-auto bg-white/10 mb-3 mt-2"></div>
                    </Show>

                    <NavItem label={t().sidebar.nav.settings} icon={<SettingsIcon/>} href="/configuracoes" />
                </div>
            </nav>

            {/* 5. Botão de Sair */}
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