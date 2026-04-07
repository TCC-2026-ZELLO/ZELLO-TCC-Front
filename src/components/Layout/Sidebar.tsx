import { Show } from "solid-js";
import { Avatar } from "~/components/Widgets/Avatar/Avatar";
import { NavItem } from "~/components/Layout/NavItem/NavItem";
import { accountRole, isDark, t, idioma } from "~/store/appState";
import { ZelloIcon, HomeIcon, PlusIcon, CalendarIcon, HeartIcon, RibbonIcon, SettingsIcon, LogoutIcon, ChevronDownIcon } from "~/components/Icons/Icons";

export function Sidebar() {
    return (
        <aside style={{
            width: "var(--sidebar-width)",
            "background-color": isDark() ? "var(--color-sidebar)" : "var(--color-mar-noturno)",
            color: isDark() ? "var(--color-sidebar-foreground)" : "#FFFFFF",
            display: "flex",
            "flex-direction": "column",
            "border-right": isDark() ? "1px solid var(--color-sidebar-border)" : "none",
            transition: "all 0.2s ease"
        }}>
            <div style={{ padding: "var(--space-6)", display: "flex", "align-items": "center", gap: "var(--space-3)" }}>
                <div style={{ width: "32px", height: "32px", "border-radius": "50%", "background-color": isDark() ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)", display: "flex", "align-items": "center", "justify-content": "center", color: isDark() ? "var(--color-primary-foreground)" : "#FFFFFF" }}>
                    {ZelloIcon}
                </div>
                <span style={{ "font-weight": "var(--font-weight-semibold)", "font-size": "var(--font-size-xl)", color: isDark() ? "var(--color-sidebar-foreground)" : "#FFFFFF" }}>
                    Zello
                </span>
            </div>

            <div style={{ padding: "0 var(--space-4) var(--space-6) var(--space-4)" }}>
                <div style={{ display: "flex", "align-items": "center", gap: "var(--space-3)", padding: "var(--space-3)", "background-color": isDark() ? "var(--color-sidebar-accent)" : "rgba(255, 255, 255, 0.05)", "border-radius": "var(--radius-sm)", cursor: "pointer" }}>
                    <Avatar size="md" fallbackInitials="AC" />
                    <div style={{ flex: 1 }}>
                        <div style={{ "font-weight": "var(--font-weight-semibold)", "font-size": "var(--font-size-sm)", color: isDark() ? "var(--color-sidebar-foreground)" : "#FFFFFF" }}>
                            {accountRole() === "cliente" ? t().sidebar.clientName : t().sidebar.profName}
                        </div>
                        <div style={{ "font-size": "var(--font-size-xs)", color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF" }}>
                            {accountRole() === "cliente" ? t().sidebar.clientTier : t().sidebar.profTier}
                        </div>
                    </div>
                    <span style={{ color: isDark() ? "var(--color-muted-foreground)" : "#9CA3AF" }}>{ChevronDownIcon}</span>
                </div>
            </div>

            <nav style={{ flex: 1, padding: "0 var(--space-4)", display: "flex", "flex-direction": "column", gap: "var(--space-1)", "overflow-y": "auto" }}>
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