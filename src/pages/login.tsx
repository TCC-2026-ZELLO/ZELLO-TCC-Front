import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { GoogleIcon, StarIcon, ZelloIcon } from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Input } from "../components/Widgets/Input";
import { LanguageSwitcher } from "../components/Widgets/LanguageSwitcher";
import { ThemeSwitcher } from "../components/Widgets/ThemeSwitcher";
import {
    formatDecimal,
    formatInteger,
    localizeDomain,
    t,
} from "../core/i18n";
import { login } from "../services/auth.service";
import { API } from "../store/appState";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [errorMessage, setErrorMessage] = createSignal("");

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            await login({
                email: email().trim(),
                password: password(),
            });
            navigate("/explore");
        } catch (error: any) {
            setErrorMessage(
                localizeDomain.apiError(
                    error?.message,
                    t().auth.login.invalidCredentials,
                ),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main class="min-h-dvh bg-background text-foreground">
            <div class="flex min-h-dvh flex-col lg:flex-row">
                {/* LADO ESQUERDO: BANNER */}
                <div class="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-border/20 bg-sidebar p-8 lg:flex">
                    <div class="z-10 flex max-w-md flex-col items-center text-center">
                        <A
                            href="/"
                            class="mb-6 flex size-16 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground transition-transform hover:scale-105"
                        >
                            <ZelloIcon />
                        </A>

                        <span class="mb-3 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">
                            {t().auth.login.bannerBadge}
                        </span>
                        <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
                            {t().auth.login.bannerTitle}
                        </h1>
                        <p class="mb-10 text-base leading-relaxed text-sidebar-foreground/80">
                            {t().auth.login.bannerDesc}
                        </p>

                        <div class="grid w-full grid-cols-3 gap-3">
                            <div class="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div class="text-xl font-bold text-sidebar-foreground">
                                    {formatInteger(2400)}+
                                </div>
                                <div class="mt-1 text-xs text-sidebar-foreground/75">
                                    {t().auth.stats.establishmentsLabel}
                                </div>
                            </div>
                            <div class="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div class="text-xl font-bold text-sidebar-foreground">
                                    {formatInteger(18000)}+
                                </div>
                                <div class="mt-1 text-xs text-sidebar-foreground/75">
                                    {t().auth.stats.appointmentsLabel}
                                </div>
                            </div>
                            <div class="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div class="flex items-center justify-center gap-1 text-xl font-bold text-sidebar-foreground">
                                    {formatDecimal(4.9)}
                                    <StarIcon class="size-4 text-warning" />
                                </div>
                                <div class="mt-1 text-xs text-sidebar-foreground/75">
                                    {t().auth.stats.ratingLabel}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO: FORMULÁRIO */}
                <div class="flex flex-1 flex-col bg-background px-4 py-6 sm:px-8">
                    <div class="flex items-center justify-between">
                        <A
                            href="/"
                            class="flex items-center gap-2 font-bold text-foreground lg:invisible"
                        >
                            <div class="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <ZelloIcon />
                            </div>
                            <span>{t().sidebar.brand}</span>
                        </A>
                        <div class="flex items-center gap-2">
                            <LanguageSwitcher compact />
                            <ThemeSwitcher />
                        </div>
                    </div>

                    <div class="my-auto flex w-full justify-center py-8">
                        <div class="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8">
                            <div>
                                <h1 class="mb-1.5 text-2xl font-bold text-foreground">
                                    {t().auth.login.title}
                                </h1>
                                <p class="text-sm text-muted-foreground">
                                    {t().auth.login.subtitle}
                                </p>
                            </div>

                            <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <Input
                                    labelText={t().auth.login.emailLabel}
                                    placeholder={t().auth.login.emailPlaceholder}
                                    type="email"
                                    value={email()}
                                    onInput={(e) => setEmail(e.currentTarget.value)}
                                    disabled={loading()}
                                    required
                                />

                                <div class="relative">
                                    <A
                                        href="/passwordRecovery"
                                        class="absolute right-0 top-0 text-xs font-semibold text-primary hover:underline"
                                    >
                                        {t().auth.login.forgotPassword}
                                    </A>
                                    <Input
                                        labelText={t().auth.login.passwordLabel}
                                        placeholder={t().auth.login.passwordPlaceholder}
                                        type="password"
                                        value={password()}
                                        onInput={(e) =>
                                            setPassword(e.currentTarget.value)
                                        }
                                        disabled={loading()}
                                        required
                                    />
                                </div>

                                <Show when={errorMessage()}>
                                    <div
                                        role="alert"
                                        class="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error"
                                    >
                                        {errorMessage()}
                                    </div>
                                </Show>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    class="mt-2 w-full justify-center"
                                    disabled={
                                        loading() ||
                                        email().trim().length === 0 ||
                                        password().length === 0
                                    }
                                >
                                    {loading()
                                        ? t().auth.login.submitting
                                        : t().auth.login.submit}
                                </Button>
                            </form>

                            <div class="flex items-center gap-3 text-xs text-muted-foreground">
                                <div class="h-px flex-1 bg-border" />
                                {t().auth.login.orContinueWith}
                                <div class="h-px flex-1 bg-border" />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                class="w-full justify-center"
                                disabled={loading()}
                                onClick={() => {
                                    window.location.href = `${API}/auth/google`;
                                }}
                            >
                                <GoogleIcon />
                                {t().auth.login.googleBtn}
                            </Button>

                            <div class="text-center text-sm text-muted-foreground">
                                {t().auth.login.noAccount}{" "}
                                <A
                                    href="/register"
                                    class="font-bold text-primary hover:underline"
                                >
                                    {t().auth.login.createAccount}
                                </A>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
