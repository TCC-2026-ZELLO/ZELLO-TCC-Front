import { createSignal, For, Show, type Component } from "solid-js";
import {
    BriefcaseIcon,
    CheckCircleIcon,
    EyeIcon,
    FlagBrIcon,
    FlagEsIcon,
    FlagUsIcon,
    GlobeIcon,
    HomeIcon,
    LockIcon,
    MoonIcon,
    SaveIcon,
    StarIcon,
    SunIcon,
} from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { Input } from "../components/Widgets/Input";
import { Switch } from "../components/Widgets/Switch";
import { container } from "../core/container";
import { Specifications } from "../core/domain/specifications/Validators";
import {
    formatDate,
    formatDecimal,
    formatDistance,
    formatMoney,
    formatMoneyHint,
    formatTime,
    idioma,
    localizeDomain,
    setIdioma,
    t,
} from "../core/i18n";
import {
    currentUser,
    type LanguageCode,
    persistAuthSession,
    setThemeMode,
    theme,
    type ThemeMode,
} from "../store/appState";
import { toast } from "../store/toastStore";

const SAMPLE_PREVIEW_DATE = new Date(2026, 9, 24, 14, 30);

export default function Settings() {
    const [nomeBase, setNomeBase] = createSignal("");
    const [loadingBasic, setLoadingBasic] = createSignal(false);

    const [senhaAtual, setSenhaAtual] = createSignal("");
    const [novaSenha, setNovaSenha] = createSignal("");
    const [confirmarSenha, setConfirmarSenha] = createSignal("");
    const [loadingSecurity, setLoadingSecurity] = createSignal(false);
    const [passwordError, setPasswordError] = createSignal("");

    const [wantsEmail, setWantsEmail] = createSignal(
        currentUser()?.wantsEmailReminders ?? true,
    );
    const [wantsWhatsapp, setWantsWhatsapp] = createSignal(
        currentUser()?.wantsWhatsappReminders ?? true,
    );
    const [loadingReminders, setLoadingReminders] = createSignal(false);

    const [loadingProfile, setLoadingProfile] = createSignal<string | null>(null);

    const hasRole = (role: string) => currentUser()?.roles?.includes(role);

    const handleSaveReminders = async () => {
        const user = currentUser();
        if (!user) return;
        setLoadingReminders(true);
        try {
            await container.userRepo.updateReminderPreferences(user.id, {
                wantsEmailReminders: wantsEmail(),
                wantsWhatsappReminders: wantsWhatsapp(),
            });
            persistAuthSession({
                user: {
                    ...user,
                    wantsEmailReminders: wantsEmail(),
                    wantsWhatsappReminders: wantsWhatsapp(),
                },
            });
            toast.success(t().settings.notifications.savedSuccess);
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(
                    e?.message,
                    t().settings.notifications.saveError,
                ),
            );
        } finally {
            setLoadingReminders(false);
        }
    };

    const handleSaveBasicData = async () => {
        const user = currentUser();
        const newName = (nomeBase() || user?.name || "").trim();
        if (!user || !newName) return;

        setLoadingBasic(true);
        try {
            const updatedUser = await container.userRepo.updateBasicInfo(user.id, {
                nome: newName,
            });
            persistAuthSession({ user: updatedUser });
            toast.success(t().settings.profile.savedSuccess);
        } catch (error: any) {
            toast.error(
                localizeDomain.apiError(
                    error?.message,
                    t().settings.profile.saveError,
                ),
            );
        } finally {
            setLoadingBasic(false);
        }
    };

    const handleAppendProfile = async (type: "professional" | "manager" | "client") => {
        setLoadingProfile(type);
        try {
            const updatedUser = await container.userRepo.appendProfile(type);
            persistAuthSession({ user: updatedUser });
            const roleLabel = localizeDomain.role(type);
            toast.success(t().settings.roles.activatedToast(roleLabel));
        } catch (error: any) {
            toast.error(
                localizeDomain.apiError(
                    error?.message,
                    t().settings.roles.activateError,
                ),
            );
        } finally {
            setLoadingProfile(null);
        }
    };

    const handleSavePassword = async () => {
        const user = currentUser();
        if (!user || user.provider === "google") return;

        setPasswordError("");
        if (!senhaAtual()) {
            setPasswordError(t().validation.requiredField);
            return;
        }
        if (!Specifications.strongPassword.isSatisfiedBy(novaSenha())) {
            setPasswordError(t().validation.weakPassword);
            return;
        }
        if (novaSenha() !== confirmarSenha()) {
            setPasswordError(t().validation.passwordMismatch);
            return;
        }

        setLoadingSecurity(true);
        try {
            await container.userRepo.changePassword(user.id, {
                currentPassword: senhaAtual(),
                password: novaSenha(),
            });
            toast.success(t().settings.security.passwordChanged);
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
        } catch (error: any) {
            const msg = localizeDomain.apiError(
                error?.message,
                t().settings.security.wrongCurrentPassword,
            );
            setPasswordError(msg);
            toast.error(msg);
        } finally {
            setLoadingSecurity(false);
        }
    };

    const themeCards = (): Array<{
        mode: ThemeMode;
        title: string;
        desc: string;
        swatchClass: string;
    }> => [
        {
            mode: "light",
            title: t().themes.light,
            desc: t().themes.lightDesc,
            swatchClass: "bg-[#f8fafc] border-slate-300 text-slate-900",
        },
        {
            mode: "dark",
            title: t().themes.dark,
            desc: t().themes.darkDesc,
            swatchClass: "bg-[#0f172a] border-slate-700 text-slate-100",
        },
        {
            mode: "high-contrast",
            title: t().themes.highContrast,
            desc: t().themes.highContrastDesc,
            swatchClass: "bg-black border-2 border-yellow-400 text-yellow-300",
        },
    ];

    const languageCards = (): Array<{
        code: LanguageCode;
        FlagIcon: Component<any>;
        title: string;
        currencyTag: string;
    }> => [
        { code: "PT", FlagIcon: FlagBrIcon, title: t().languages.pt, currencyTag: "BRL (R$) · km · 24h" },
        { code: "EN", FlagIcon: FlagUsIcon, title: t().languages.en, currencyTag: "USD ($) · mi · 12h" },
        { code: "ES", FlagIcon: FlagEsIcon, title: t().languages.es, currencyTag: "EUR (€) · km · 24h" },
    ];

    return (
        <Show
            when={currentUser()}
            fallback={
                <div class="p-16 text-center text-muted-foreground animate-pulse">
                    {t().settings.loading}
                </div>
            }
        >
            <div class="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-6 sm:py-8 pb-20 md:py-12 animate-in fade-in duration-300">
                <header class="flex flex-col gap-1">
                    <h1 class="text-2xl sm:text-3xl font-bold text-foreground">
                        {t().settings.title}
                    </h1>
                    <p class="text-sm sm:text-base text-muted-foreground">
                        {t().settings.subtitle}
                    </p>
                </header>

                {/* DADOS BÁSICOS */}
                <section class="flex flex-col gap-4">
                    <h2 class="text-lg font-semibold text-foreground">
                        {t().settings.profile.title}
                    </h2>
                    <Card class="flex flex-col gap-6 p-5 sm:p-8 border-border">
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <Input
                                labelText={t().settings.profile.nameLabel}
                                value={nomeBase() || currentUser()?.name || ""}
                                onInput={(e) => setNomeBase(e.currentTarget.value)}
                                required
                            />
                            <Input
                                labelText={t().settings.profile.emailLabel}
                                value={currentUser()?.email || ""}
                                disabled
                            />
                        </div>

                        <Button
                            variant="primary"
                            class="w-full sm:w-fit"
                            onClick={handleSaveBasicData}
                            disabled={loadingBasic()}
                        >
                            <SaveIcon class="mr-2" />{" "}
                            {loadingBasic()
                                ? t().common.saving
                                : t().settings.profile.saveBtn}
                        </Button>
                    </Card>
                </section>

                {/* MEUS PERFIS */}
                <section class="flex flex-col gap-4">
                    <h2 class="text-lg font-semibold text-foreground">
                        {t().settings.roles.title}
                    </h2>
                    <p class="text-sm text-muted-foreground -mt-2">
                        {t().settings.roles.subtitle}
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card Cliente */}
                        <Card class="p-5 sm:p-6 flex flex-col justify-between gap-6 border-border">
                            <div class="flex items-start gap-4">
                                <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <EyeIcon size={24} />
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-foreground">
                                        {t().settings.roles.clientTitle}
                                    </span>
                                    <p class="text-xs text-muted-foreground mt-0.5">
                                        {t().settings.roles.clientDesc}
                                    </p>
                                </div>
                            </div>
                            <Show
                                when={hasRole("client")}
                                fallback={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAppendProfile("client")}
                                        disabled={!!loadingProfile()}
                                    >
                                        {loadingProfile() === "client"
                                            ? t().settings.roles.activatingBtn
                                            : t().settings.roles.activateBtn}
                                    </Button>
                                }
                            >
                                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                                    <CheckCircleIcon size={16} /> {t().common.active}
                                </div>
                            </Show>
                        </Card>

                        {/* Card Profissional */}
                        <Card class="p-5 sm:p-6 flex flex-col justify-between gap-6 border-border">
                            <div class="flex items-start gap-4">
                                <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <BriefcaseIcon size={24} />
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-foreground">
                                        {t().settings.roles.proTitle}
                                    </span>
                                    <p class="text-xs text-muted-foreground mt-0.5">
                                        {t().settings.roles.proDesc}
                                    </p>
                                </div>
                            </div>
                            <Show
                                when={hasRole("professional")}
                                fallback={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAppendProfile("professional")}
                                        disabled={!!loadingProfile()}
                                    >
                                        {loadingProfile() === "professional"
                                            ? t().settings.roles.activatingBtn
                                            : t().settings.roles.activateBtn}
                                    </Button>
                                }
                            >
                                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                                    <CheckCircleIcon size={16} /> {t().common.active}
                                </div>
                            </Show>
                        </Card>

                        {/* Card Gestor */}
                        <Card class="p-5 sm:p-6 flex flex-col justify-between gap-6 border-border">
                            <div class="flex items-start gap-4">
                                <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                                    <HomeIcon size={24} />
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-foreground">
                                        {t().settings.roles.managerTitle}
                                    </span>
                                    <p class="text-xs text-muted-foreground mt-0.5">
                                        {t().settings.roles.managerDesc}
                                    </p>
                                </div>
                            </div>
                            <Show
                                when={hasRole("manager")}
                                fallback={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAppendProfile("manager")}
                                        disabled={!!loadingProfile()}
                                    >
                                        {loadingProfile() === "manager"
                                            ? t().settings.roles.activatingBtn
                                            : t().settings.roles.activateBtn}
                                    </Button>
                                }
                            >
                                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                                    <CheckCircleIcon size={16} /> {t().common.active}
                                </div>
                            </Show>
                        </Card>
                    </div>
                </section>

                <section class="flex flex-col gap-4">
                    <h2 class="text-lg font-semibold text-foreground">
                        {t().settings.appearance.title}
                    </h2>
                    <Card class="flex flex-col gap-8 p-5 sm:p-8 border-border">
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-3">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                    <Show when={theme() === "dark"} fallback={<SunIcon />}>
                                        <MoonIcon />
                                    </Show>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-semibold text-foreground">
                                        {t().settings.appearance.theme}
                                    </span>
                                    <span class="text-sm text-muted-foreground">
                                        {t().settings.appearance.themeDesc}
                                    </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <For each={themeCards()}>
                                    {(card) => {
                                        const isSelected = () => theme() === card.mode;
                                        return (
                                            <button
                                                type="button"
                                                aria-pressed={isSelected()}
                                                onClick={() => setThemeMode(card.mode)}
                                                class={`flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                                                    isSelected()
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                                                        : "border-border hover:bg-muted/40"
                                                }`}
                                            >
                                                <div class="flex items-center justify-between gap-2">
                                                    <span
                                                        class={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-xs font-bold ${card.swatchClass}`}
                                                    >
                                                        Aa
                                                    </span>
                                                    <Show when={isSelected()}>
                                                        <span class="text-primary">
                                                            <CheckCircleIcon size={18} />
                                                        </span>
                                                    </Show>
                                                </div>
                                                <div>
                                                    <div class="font-bold text-sm text-foreground">
                                                        {card.title}
                                                    </div>
                                                    <p class="text-xs text-muted-foreground mt-0.5">
                                                        {card.desc}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    }}
                                </For>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4 border-t border-border pt-6">
                            <div class="flex items-center gap-3">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                    <GlobeIcon />
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-semibold text-foreground">
                                        {t().settings.appearance.language}
                                    </span>
                                    <span class="text-sm text-muted-foreground">
                                        {t().settings.appearance.languageDesc}
                                    </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <For each={languageCards()}>
                                    {(langCard) => {
                                        const isSelected = () => idioma() === langCard.code;
                                        return (
                                            <button
                                                type="button"
                                                aria-pressed={isSelected()}
                                                onClick={() => setIdioma(langCard.code)}
                                                class={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                                                    isSelected()
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                                                        : "border-border hover:bg-muted/40"
                                                }`}
                                            >
                                                <div class="flex items-center justify-between">
                                                    <span aria-hidden="true" class="inline-flex">
                                                        <langCard.FlagIcon class="h-4 w-6 rounded-xs shadow-2xs" />
                                                    </span>
                                                    <Show when={isSelected()}>
                                                        <span class="text-primary">
                                                            <CheckCircleIcon size={18} />
                                                        </span>
                                                    </Show>
                                                </div>
                                                <div class="font-bold text-sm text-foreground">
                                                    {langCard.title}
                                                </div>
                                                <div class="text-xs text-muted-foreground">
                                                    {langCard.currencyTag}
                                                </div>
                                            </button>
                                        );
                                    }}
                                </For>
                            </div>

                            <div class="rounded-xl bg-muted/40 border border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <span class="text-muted-foreground">
                                    {t().languages.currencyInfo}
                                </span>
                                <div class="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                                    <span class="px-2 py-1 rounded-md bg-card border border-border">
                                        {formatDate(SAMPLE_PREVIEW_DATE)} ·{" "}
                                        {formatTime("14:30")}
                                    </span>
                                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border">
                                        <StarIcon class="size-3.5 text-warning" />
                                        {formatDecimal(4.9, 1)} · {formatDistance(2.5)}
                                    </span>
                                    <span
                                        class="px-2 py-1 rounded-md bg-card border border-border text-primary"
                                        title={formatMoneyHint(120) ?? undefined}
                                    >
                                        {formatMoney(120)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* NOTIFICAÇÕES E LEMBRETES */}
                <section class="flex flex-col gap-4">
                    <h2 class="text-lg font-semibold text-foreground">
                        {t().settings.notifications.title}
                    </h2>
                    <Card class="flex flex-col p-5 sm:p-8 border-border gap-6">
                        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                            <div class="flex items-center gap-4">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                    <svg
                                        class="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-medium text-foreground">
                                        {t().settings.notifications.emailTitle}
                                    </span>
                                    <span class="text-sm text-muted-foreground">
                                        {t().settings.notifications.emailDesc}
                                    </span>
                                </div>
                            </div>
                            <Switch
                                checked={wantsEmail()}
                                onChange={() => setWantsEmail(!wantsEmail())}
                            />
                        </div>

                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-600 dark:text-emerald-400">
                                    <svg
                                        class="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-medium text-foreground">
                                        {t().settings.notifications.whatsappTitle}
                                    </span>
                                    <span class="text-sm text-muted-foreground">
                                        {t().settings.notifications.whatsappDesc}
                                    </span>
                                </div>
                            </div>
                            <Switch
                                checked={wantsWhatsapp()}
                                onChange={() => setWantsWhatsapp(!wantsWhatsapp())}
                            />
                        </div>

                        <Button
                            variant="primary"
                            class="w-full sm:w-fit"
                            onClick={handleSaveReminders}
                            disabled={loadingReminders()}
                        >
                            {loadingReminders()
                                ? t().common.saving
                                : t().settings.notifications.saveBtn}
                        </Button>
                    </Card>
                </section>

                {/* SEGURANÇA */}
                <Show when={currentUser()?.provider !== "google"}>
                    <section class="flex flex-col gap-4">
                        <h2 class="text-lg font-semibold text-foreground">
                            {t().settings.security.title}
                        </h2>
                        <Card class="flex flex-col gap-6 p-5 sm:p-8 border-border">
                            <Input
                                labelText={t().settings.security.currentPassword}
                                type="password"
                                value={senhaAtual()}
                                onInput={(e) => setSenhaAtual(e.currentTarget.value)}
                                required
                            />
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    labelText={t().settings.security.newPassword}
                                    type="password"
                                    value={novaSenha()}
                                    onInput={(e) => setNovaSenha(e.currentTarget.value)}
                                    required
                                />
                                <Input
                                    labelText={t().settings.security.confirmPassword}
                                    type="password"
                                    value={confirmarSenha()}
                                    onInput={(e) =>
                                        setConfirmarSenha(e.currentTarget.value)
                                    }
                                    required
                                />
                            </div>

                            <Show when={passwordError()}>
                                <div class="rounded-lg px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                    {passwordError()}
                                </div>
                            </Show>

                            <Button
                                variant="primary"
                                class="w-full sm:w-fit"
                                onClick={handleSavePassword}
                                disabled={loadingSecurity()}
                            >
                                <LockIcon class="mr-2" />{" "}
                                {loadingSecurity()
                                    ? t().settings.security.processing
                                    : t().settings.security.changePasswordBtn}
                            </Button>
                        </Card>
                    </section>
                </Show>
            </div>
        </Show>
    );
}