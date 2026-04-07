import { createSignal } from "solid-js";
import { Card } from "~/components/Widgets/Card/Card";
import { Button } from "~/components/Widgets/Button/Button";
import { Input } from "~/components/Widgets/Input/Input";
import { Switch } from "~/components/Widgets/Switch/Switch";
import { Tabs } from "~/components/Widgets/Tabs/Tabs";
import { accountRole, idioma, setIdioma, theme, toggleTheme, t } from "~/store/appState";
import { Language } from "~/store/translations";
import { CameraIcon, SaveIcon, GlobeIcon, SunIcon, LockIcon } from "~/components/Icons/Icons";

export default function Settings() {
    const [novaSenha, setNovaSenha] = createSignal("");

    const errors = {
        PT: { reqName: "O nome é obrigatório.", reqPhone: "Telefone incompleto.", reqEmail: "O e-mail é obrigatório.", invalidEmail: "E-mail inválido.", reqCity: "A cidade é obrigatória.", reqCurrentPass: "A senha atual é obrigatória.", minPass: "Mínimo de 6 caracteres.", passMismatch: "As senhas não coincidem." },
        EN: { reqName: "Name is required.", reqPhone: "Incomplete phone.", reqEmail: "Email is required.", invalidEmail: "Invalid email.", reqCity: "City is required.", reqCurrentPass: "Current password is required.", minPass: "Minimum of 6 characters.", passMismatch: "Passwords do not match." }
    };

    const err = () => errors[idioma()];

    return (
        <div style={{ "max-width": "800px", margin: "0 auto", "padding-bottom": "var(--space-10)" }}>
            <div style={{ "margin-bottom": "var(--space-8)" }}>
                <h1 style={{ "font-size": "var(--font-size-3xl)", "font-weight": "var(--font-weight-bold)", color: "var(--color-foreground)", margin: "0 0 8px 0" }}>
                    {t().settings.title}
                </h1>
                <p style={{ color: "var(--color-muted-foreground)", margin: 0 }}>
                    {accountRole() === "cliente" ? t().sidebar.clientName : t().sidebar.profName}
                </p>
            </div>

            <h2 style={{ "font-size": "var(--font-size-base)", "font-weight": "var(--font-weight-semibold)", "margin-bottom": "var(--space-4)", color: "var(--color-foreground)" }}>
                {t().settings.profile.title}
            </h2>
            <Card style={{ "margin-bottom": "var(--space-10)", padding: "var(--space-8)" }}>
                <div style={{ display: "flex", "align-items": "center", gap: "var(--space-6)", "margin-bottom": "var(--space-8)" }}>
                    <div style={{ position: "relative" }}>
                        <img src="https://i.pravatar.cc/150?img=47" alt="Profile" style={{ width: "80px", height: "80px", "border-radius": "var(--radius-xl)", "object-fit": "cover" }} />
                        <div style={{ position: "absolute", bottom: "-8px", right: "-8px", "background-color": "var(--color-primary)", "border-radius": "50%", width: "28px", height: "28px", display: "flex", "align-items": "center", "justify-content": "center", border: "2px solid var(--color-card)", color: "var(--color-primary-foreground)", cursor: "pointer" }}>
                            {CameraIcon}
                        </div>
                    </div>
                    <div>
                        <div style={{ "font-weight": "var(--font-weight-semibold)", "font-size": "var(--font-size-sm)", color: "var(--color-foreground)", "margin-bottom": "4px" }}>{t().settings.profile.photo}</div>
                        <div style={{ "font-size": "13px", color: "var(--color-cliente)", "font-weight": "var(--font-weight-medium)", cursor: "pointer" }}>{t().settings.profile.changePhoto}</div>
                    </div>
                </div>

                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "var(--space-6)", "margin-bottom": "var(--space-8)" }}>
                    <Input labelText={t().settings.profile.nameLabel} placeholder="Ana Clara Matos" type="text" onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "")} validate={(val) => !val.trim() ? err().reqName : null} />
                    <Input labelText={t().settings.profile.phoneLabel} placeholder="(41) 9 9812-2234" type="tel" onInput={(e) => { let v = e.currentTarget.value.replace(/\D/g, ""); if (v.length > 11) v = v.slice(0, 11); if (v.length > 7) e.currentTarget.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`; else if (v.length > 2) e.currentTarget.value = `(${v.slice(0, 2)}) ${v.slice(2)}`; else e.currentTarget.value = v; }} validate={(val) => val.replace(/\D/g, "").length < 10 ? err().reqPhone : null} />
                    <Input labelText={t().settings.profile.emailLabel} placeholder="ana@email.com" type="email" validate={(val) => { if (!val.trim()) return err().reqEmail; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return err().invalidEmail; return null; }} />
                    <Input labelText={t().settings.profile.cityLabel} placeholder="Curitiba - PR" type="text" validate={(val) => !val.trim() ? err().reqCity : null} />
                </div>
                <Button variant="primary" style={{ "background-color": "var(--color-primary)", color: "var(--color-primary-foreground)", display: "flex", gap: "8px", "align-items": "center" }}>
                    {SaveIcon} {t().settings.profile.saveBtn}
                </Button>
            </Card>

            <h2 style={{ "font-size": "var(--font-size-base)", "font-weight": "var(--font-weight-semibold)", "margin-bottom": "var(--space-4)", color: "var(--color-foreground)" }}>
                {t().settings.appearance.title}
            </h2>
            <Card style={{ "margin-bottom": "var(--space-10)" }}>
                <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", padding: "var(--space-6)", "border-bottom": "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", "align-items": "center", gap: "var(--space-4)" }}>
                        <div style={{ width: "40px", height: "40px", "border-radius": "50%", "background-color": "var(--color-muted)", color: "var(--color-muted-foreground)", display: "flex", "align-items": "center", "justify-content": "center" }}>{GlobeIcon}</div>
                        <span style={{ "font-weight": "var(--font-weight-medium)", color: "var(--color-foreground)" }}>{t().settings.appearance.language}</span>
                    </div>
                    <div style={{ transform: "scale(0.85)", "transform-origin": "right center" }}>
                        <Tabs activeValue={idioma()} onChange={(val) => setIdioma(val as Language)} items={[{ label: "PT", value: "PT" }, { label: "EN", value: "EN" }]} />
                    </div>
                </div>

                <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", padding: "var(--space-6)" }}>
                    <div style={{ display: "flex", "align-items": "center", gap: "var(--space-4)" }}>
                        <div style={{ width: "40px", height: "40px", "border-radius": "50%", "background-color": "var(--color-muted)", display: "flex", "align-items": "center", "justify-content": "center" }}>{SunIcon}</div>
                        <div>
                            <div style={{ "font-weight": "var(--font-weight-medium)", color: "var(--color-foreground)" }}>{t().settings.appearance.theme}</div>
                            <div style={{ "font-size": "13px", color: "var(--color-muted-foreground)" }}>{theme() === "dark" ? t().settings.appearance.darkMode : t().settings.appearance.lightMode}</div>
                        </div>
                    </div>
                    <div onClick={toggleTheme} style={{ cursor: "pointer" }}><Switch checked={theme() === "dark"} /></div>
                </div>
            </Card>

            <h2 style={{ "font-size": "var(--font-size-base)", "font-weight": "var(--font-weight-semibold)", "margin-bottom": "var(--space-4)", color: "var(--color-foreground)" }}>
                {t().settings.notifications.title}
            </h2>
            <Card style={{ "margin-bottom": "var(--space-10)" }}>
                {[ { label: t().settings.notifications.items.bookingConfirm, active: true }, { label: t().settings.notifications.items.reminder24h, active: true }, { label: t().settings.notifications.items.offers, active: false }, { label: t().settings.notifications.items.loyaltyUpdates, active: true }, { label: t().settings.notifications.items.appNews, active: false }, { label: t().settings.notifications.items.weeklySummary, active: true } ].map((notif, index) => (
                    <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", padding: "20px var(--space-6)", "border-bottom": index === 5 ? "none" : "1px solid var(--color-border)" }}>
                        <span style={{ "font-weight": "var(--font-weight-medium)", color: "var(--color-foreground)" }}>{notif.label}</span>
                        <Switch checked={notif.active} />
                    </div>
                ))}
            </Card>

            <h2 style={{ "font-size": "var(--font-size-base)", "font-weight": "var(--font-weight-semibold)", "margin-bottom": "var(--space-4)", color: "var(--color-foreground)" }}>
                {t().settings.security.title}
            </h2>
            <Card style={{ "margin-bottom": "var(--space-10)", padding: "var(--space-8)" }}>
                <div style={{ "margin-bottom": "var(--space-6)" }}>
                    <Input labelText={t().settings.security.currentPassword} type="password" placeholder="••••••••" validate={(val) => !val ? err().reqCurrentPass : null} />
                </div>
                <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "var(--space-6)", "margin-bottom": "var(--space-8)" }}>
                    <Input labelText={t().settings.security.newPassword} type="password" onInput={(e) => setNovaSenha(e.currentTarget.value)} validate={(val) => val.length > 0 && val.length < 6 ? err().minPass : null} />
                    <Input labelText={t().settings.security.confirmPassword} type="password" validate={(val) => (val || novaSenha()) && val !== novaSenha() ? err().passMismatch : null} />
                </div>
                <Button variant="primary" style={{ "background-color": "var(--color-primary)", color: "var(--color-primary-foreground)", display: "flex", gap: "8px", "align-items": "center" }}>
                    {LockIcon} {t().settings.security.changePasswordBtn}
                </Button>
            </Card>
        </div>
    );
}