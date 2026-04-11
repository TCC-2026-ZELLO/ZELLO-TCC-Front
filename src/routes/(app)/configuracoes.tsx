import { createSignal, For } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
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
        <div class="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-8 pb-20 md:py-12">

            <header class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold text-foreground">
                    {t().settings.title}
                </h1>
                <p class="text-muted-foreground">
                    {accountRole() === "cliente" ? t().sidebar.clientName : t().sidebar.profName}
                </p>
            </header>

            <section class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold text-foreground">
                    {t().settings.profile.title}
                </h2>

                <Card class="flex flex-col gap-8 p-6 md:p-8">
                    <div class="flex items-center gap-6">
                        <div class="relative">
                            <img src="https://i.pravatar.cc/150?img=47" alt="Profile" class="size-20 rounded-xl object-cover" />
                            <button type="button" class="absolute -bottom-2 -right-2 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform hover:scale-105">
                                {CameraIcon}
                            </button>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-sm font-semibold text-foreground">{t().settings.profile.photo}</span>
                            <button type="button" class="text-left text-sm font-medium text-primary hover:underline">
                                {t().settings.profile.changePhoto}
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Input labelText={t().settings.profile.nameLabel} placeholder="Ana Clara Matos" type="text" onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "")} validate={(val) => !val.trim() ? err().reqName : null} />
                        <Input labelText={t().settings.profile.phoneLabel} placeholder="(41) 9 9812-2234" type="tel" onInput={(e) => { let v = e.currentTarget.value.replace(/\D/g, ""); if (v.length > 11) v = v.slice(0, 11); if (v.length > 7) e.currentTarget.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`; else if (v.length > 2) e.currentTarget.value = `(${v.slice(0, 2)}) ${v.slice(2)}`; else e.currentTarget.value = v; }} validate={(val) => val.replace(/\D/g, "").length < 10 ? err().reqPhone : null} />
                        <Input labelText={t().settings.profile.emailLabel} placeholder="ana@email.com" type="email" validate={(val) => { if (!val.trim()) return err().reqEmail; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return err().invalidEmail; return null; }} />
                        <Input labelText={t().settings.profile.cityLabel} placeholder="Curitiba - PR" type="text" validate={(val) => !val.trim() ? err().reqCity : null} />
                    </div>

                    <div class="pt-2">
                        <Button variant="primary">
                            {SaveIcon} {t().settings.profile.saveBtn}
                        </Button>
                    </div>
                </Card>
            </section>

            <section class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold text-foreground">
                    {t().settings.appearance.title}
                </h2>

                <Card class="flex flex-col">
                    <div class="flex items-center justify-between border-b border-border p-6">
                        <div class="flex items-center gap-4">
                            <div class="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                {GlobeIcon}
                            </div>
                            <span class="font-medium text-foreground">{t().settings.appearance.language}</span>
                        </div>
                        <div class="origin-right scale-90">
                            <Tabs activeValue={idioma()} onChange={(val) => setIdioma(val as Language)} items={[{ label: "PT", value: "PT" }, { label: "EN", value: "EN" }]} />
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-6">
                        <div class="flex items-center gap-4">
                            <div class="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                {SunIcon}
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium text-foreground">{t().settings.appearance.theme}</span>
                                <span class="text-sm text-muted-foreground">{theme() === "dark" ? t().settings.appearance.darkMode : t().settings.appearance.lightMode}</span>
                            </div>
                        </div>
                        <Switch checked={theme() === "dark"} onChange={toggleTheme} />
                    </div>
                </Card>
            </section>

            <section class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold text-foreground">
                    {t().settings.notifications.title}
                </h2>

                <Card class="flex flex-col">
                    <For each={[
                        { label: t().settings.notifications.items.bookingConfirm, active: true },
                        { label: t().settings.notifications.items.reminder24h, active: true },
                        { label: t().settings.notifications.items.offers, active: false },
                        { label: t().settings.notifications.items.loyaltyUpdates, active: true },
                        { label: t().settings.notifications.items.appNews, active: false },
                        { label: t().settings.notifications.items.weeklySummary, active: true }
                    ]}>
                        {(notif) => (
                            <div class="flex items-center justify-between border-b border-border p-5 px-6 last:border-none">
                                <span class="font-medium text-foreground">{notif.label}</span>
                                <Switch checked={notif.active} />
                            </div>
                        )}
                    </For>
                </Card>
            </section>

            <section class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold text-foreground">
                    {t().settings.security.title}
                </h2>

                <Card class="flex flex-col gap-8 p-6 md:p-8">
                    <div>
                        <Input labelText={t().settings.security.currentPassword} type="password" placeholder="••••••••" validate={(val) => !val ? err().reqCurrentPass : null} />
                    </div>

                    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Input labelText={t().settings.security.newPassword} type="password" onInput={(e) => setNovaSenha(e.currentTarget.value)} validate={(val) => val.length > 0 && val.length < 6 ? err().minPass : null} />
                        <Input labelText={t().settings.security.confirmPassword} type="password" validate={(val) => (val || novaSenha()) && val !== novaSenha() ? err().passMismatch : null} />
                    </div>

                    <div class="pt-2">
                        <Button variant="primary">
                            {LockIcon} {t().settings.security.changePasswordBtn}
                        </Button>
                    </div>
                </Card>
            </section>
        </div>
    );
}