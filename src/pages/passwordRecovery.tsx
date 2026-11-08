import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { SuccessIcon, ZelloIcon } from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Input } from "../components/Widgets/Input";
import { LanguageSwitcher } from "../components/Widgets/LanguageSwitcher";
import { ThemeSwitcher } from "../components/Widgets/ThemeSwitcher";
import { container } from "../core/container";
import { localizeDomain, t } from "../core/i18n";

export default function PasswordRecovery() {
    const [email, setEmail] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [submitted, setSubmitted] = createSignal(false);
    const [errorMsg, setErrorMsg] = createSignal("");

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (loading()) return;

        setLoading(true);
        setErrorMsg("");

        try {
            await container.authRepo.requestPasswordRecovery(email().trim());
            setSubmitted(true);
        } catch (err: any) {
            setErrorMsg(
                localizeDomain.apiError(
                    err?.message,
                    t().auth.recovery.errorGeneric,
                ),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main class="min-h-dvh bg-background text-foreground">
            <div class="flex min-h-dvh flex-col lg:flex-row">
                <div class="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-border/20 bg-sidebar p-8 lg:flex">
                    <div class="z-10 flex max-w-md flex-col items-center text-center">
                        <A
                            href="/"
                            class="mb-6 flex size-16 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground"
                        >
                            <ZelloIcon />
                        </A>
                        <span class="mb-3 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">
                            {t().auth.recovery.bannerBadge}
                        </span>
                        <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
                            {t().auth.recovery.bannerTitle}
                        </h1>
                        <p class="text-base leading-relaxed text-sidebar-foreground/80">
                            {t().auth.recovery.bannerDesc}
                        </p>
                    </div>
                </div>

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
                            <Show
                                when={submitted()}
                                fallback={
                                    <>
                                        <div>
                                            <h1 class="mb-1.5 text-2xl font-bold text-foreground">
                                                {t().auth.recovery.title}
                                            </h1>
                                            <p class="text-sm text-muted-foreground">
                                                {t().auth.recovery.subtitle}
                                            </p>
                                        </div>

                                        <form
                                            class="flex flex-col gap-4"
                                            onSubmit={handleSubmit}
                                        >
                                            <Input
                                                labelText={t().auth.login.emailLabel}
                                                placeholder={
                                                    t().auth.login.emailPlaceholder
                                                }
                                                type="email"
                                                value={email()}
                                                onInput={(e) =>
                                                    setEmail(e.currentTarget.value)
                                                }
                                                required
                                            />

                                            <Show when={errorMsg()}>
                                                <div
                                                    role="alert"
                                                    class="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error"
                                                >
                                                    {errorMsg()}
                                                </div>
                                            </Show>

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                class="mt-2 w-full justify-center"
                                                disabled={loading() || !email().trim()}
                                            >
                                                {loading()
                                                    ? t().auth.recovery.submitting
                                                    : t().auth.recovery.submit}
                                            </Button>
                                        </form>
                                    </>
                                }
                            >
                                <div class="flex flex-col items-center gap-4 py-4 text-center">
                                    <div class="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
                                        <SuccessIcon />
                                    </div>
                                    <div>
                                        <h2 class="text-xl font-bold text-foreground">
                                            {t().auth.recovery.sentTitle}
                                        </h2>
                                        <p class="mt-2 text-sm text-muted-foreground">
                                            {t().auth.recovery.sentDesc(email())}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        {t().auth.recovery.sendAnother}
                                    </Button>
                                </div>
                            </Show>

                            <div class="text-center text-sm">
                                <A
                                    href="/login"
                                    class="font-semibold text-primary hover:underline"
                                >
                                    ← {t().auth.recovery.backToLogin}
                                </A>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
