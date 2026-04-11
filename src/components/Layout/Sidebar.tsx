import { Show } from "solid-js";
import { Avatar } from "~/components/Widgets/Avatar";
import { NavItem } from "~/components/Layout/NavItem";
import { accountRole, isDark, t, idioma } from "~/store/appState";
import { ZelloIcon, HomeIcon, PlusIcon, CalendarIcon, HeartIcon, RibbonIcon, SettingsIcon, LogoutIcon, ChevronDownIcon } from "~/components/Icons/Icons";


export function Sidebar() {
    return (
        <aside
            class="flex flex-col w-[--sidebar-width] transition-all duration-200 border-r"
            classList={{
                "bg-sidebar text-white border-white/10": isDark(),
                "bg-[#1A2B42] text-white border-none": !isDark()
            }}
        >
            <div class="p-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white">
                    {ZelloIcon}
                </div>
                <span class="font-semibold text-xl">Zello</span>
            </div>

            <div class="px-4 pb-6">
                <div class="flex items-center gap-3 p-3 rounded-sm cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                    <Avatar size="md" fallbackInitials="AC" />
                    <div class="flex-1">
                        <div class="font-semibold text-sm">
                            {accountRole() === "cliente" ? t().sidebar.clientName : t().sidebar.profName}
                        </div>
                        <div class="text-xs text-gray-400">
                            {accountRole() === "cliente" ? t().sidebar.clientTier : t().sidebar.profTier}
                        </div>
                    </div>
                    <span class="text-gray-400">{ChevronDownIcon}</span>
                </div>
            </div>

            <nav class="flex-1 px-4 flex flex-col gap-3 overflow-y-auto">
                <Show when={accountRole() === "cliente"}>
                    <NavItem label={t().sidebar.nav.home} icon={HomeIcon} href="/" />
                    <NavItem label={t().sidebar.nav.newBooking} icon={PlusIcon} href="/nova-reserva" />
                    <NavItem label={t().sidebar.nav.myBookings} icon={CalendarIcon} badge={2} href="/agendamentos" />
                    <NavItem label={t().sidebar.nav.favorites} icon={HeartIcon} href="/favoritos" />
                    <NavItem label={t().sidebar.nav.loyalty} icon={RibbonIcon} badge={idioma() === "PT" ? "Ouro" : "Gold"} href="/fidelidade" />
                </Show>

                <Show when={accountRole() === "profissional"}>
                    <NavItem label={t().sidebar.nav.dashboard} icon={HomeIcon} href="/" />
                    <NavItem label={t().sidebar.nav.mySchedule} icon={CalendarIcon} href="/agenda" />
                    <NavItem label={t().sidebar.nav.clients} icon={HeartIcon} href="/clientes" />
                    <NavItem label={t().sidebar.nav.servicesPortfolio} icon={PlusIcon} href="/portfolio" />
                </Show>

                <div style={{ "margin-top": "var(--space-6)" }}>
                    <div style={{ "font-size": "11px", "font-weight": "var(--font-weight-semibold)", color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF", "letter-spacing": "1px", "margin-bottom": "var(--space-2)", "padding-left": "var(--space-3)", "text-transform": "uppercase" }}>
                        {t().sidebar.nav.account}
                    </div>
                    <NavItem label={t().sidebar.nav.settings} icon={SettingsIcon} href="/configuracoes" />
                </div>
            </nav>

            <div style={{ padding: "var(--space-4)" }}>
                <div style={{ display: "flex", "align-items": "center", gap: "var(--space-3)", padding: "var(--space-3)", cursor: "pointer", color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF" }}>
                    {LogoutIcon}
                    <span style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-medium)" }}>{t().sidebar.nav.logout}</span>
                </div>
            </div>
        </aside>
    );
}