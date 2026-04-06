import { Badge } from "~/components/Widgets/Badge/Badge";
import { Button } from "~/components/Widgets/Button/Button";
import { accountRole, idioma, theme, toggleRole, toggleTheme, t } from "~/store/appState";
import { MenuIcon, GlobeIcon, SunIcon, MoonIcon, ChevronDownIcon, BellIcon } from "~/components/Icons/Icons";

export function Header() {
    return (
        <header style={{ height: "72px", "background-color": "var(--color-card)", "border-bottom": "1px solid var(--color-border)", display: "flex", "align-items": "center", "justify-content": "space-between", padding: "0 var(--space-8)", transition: "all 0.2s ease" }}>
            <div style={{ display: "flex", "align-items": "center", gap: "var(--space-4)" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted-foreground)" }}>{MenuIcon}</button>
                <span style={{ "font-weight": "var(--font-weight-semibold)", "font-size": "var(--font-size-base)", color: "var(--color-foreground)" }}>{t().header.home}</span>
                <Badge variant="default" style={{ "background-color": "var(--color-muted)", color: "var(--color-cliente)" }}>
                    {accountRole() === "cliente" ? `${t().header.badgeClient} • ${t().sidebar.clientName}` : `${t().header.badgeProf} • ${t().sidebar.profName}`}
                </Badge>
            </div>

            <div style={{ display: "flex", "align-items": "center", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", "align-items": "center", gap: "var(--space-2)", padding: "6px 12px", border: "1px solid var(--color-border)", "border-radius": "20px", "font-size": "var(--font-size-sm)", color: "var(--color-foreground)" }}>
                    {GlobeIcon} {idioma()}
                </div>

                <button onClick={toggleTheme} style={{ background: "none", border: "1px solid var(--color-border)", "border-radius": "50%", width: "36px", height: "36px", display: "flex", "align-items": "center", "justify-content": "center", cursor: "pointer", color: "var(--color-foreground)", transition: "all 0.2s ease" }}>
                    {theme() === "dark" ? SunIcon : MoonIcon}
                </button>

                <Button variant="primary" onClick={toggleRole} style={{ "background-color": "var(--color-cliente)", color: "white", "border-radius": "20px", padding: "6px 16px", display: "flex", gap: "6px", "align-items": "center" }}>
                    Demo: {accountRole() === "cliente" ? t().header.badgeClient : t().header.badgeProf} {ChevronDownIcon}
                </Button>

                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted-foreground)" }}>
                    {BellIcon}
                </button>
            </div>
        </header>
    );
}