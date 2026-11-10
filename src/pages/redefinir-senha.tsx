import { A, useSearchParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { LockIcon, ZelloIcon } from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Input } from "../components/Widgets/Input";
import { LanguageSwitcher } from "../components/Widgets/LanguageSwitcher";
import { ThemeSwitcher } from "../components/Widgets/ThemeSwitcher";
import { container } from "../core/container";
import { Specifications } from "../core/domain/specifications/Validators";
import { localizeDomain, t } from "../core/i18n";

export default function RedefinirSenha() {
    const [searchParams] = useSearchParams();
    const token = () => {
        const raw = searchParams.token;
        return Array.isArray(raw) ? raw[0] : raw;
    };

    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [success, setSuccess] = createSignal(false);
    const [error, setError] = createSignal("");

    const validatePassword = (pass: string) => {
        if (!pass) return null;
        return Specifications.strongPassword.isSatisfiedBy(pass)
            ? null
            : t().validation.weakPassword;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");

        const strengthError = validatePassword(password());
        if (strengthError) {
            setError(strengthError);
            return;
        }

        if (password() !== confirmPassword()) {
            setError(t().validation.passwordMismatch);
            return;
        }

        const currentToken = token();
        if (!currentToken) {
            setError(t().auth.reset.missingToken);
            return;
        }

        setLoading(true);
        try {
            await container.authRepo.resetPassword(currentToken, password());
            setSuccess(true);
        } catch (err: any) {
            setError(
                localizeDomain.apiError(err?.message, t().common.genericError),
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
                        <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
                            {t().auth.reset.bannerTitle}
                        </h1>
                        <p class="text-base leading-relaxed text-sidebar-foreground/80">
                            {t().auth.reset.bannerDesc}
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
                                when={success()}
                                fallback={
                                    <>
                                        <div>
                                            <h1 class="mb-1.5 text-2xl font-bold text-foreground">
                                                {t().auth.reset.title}
                                            </h1>
                                            <p class="text-sm text-muted-foreground">
                                                {t().auth.reset.subtitle}
                                            </p>
                                        </div>

                                        <form
                                            class="flex flex-col gap-4"
                                            onSubmit={handleSubmit}
                                        >
                                            <Input
                                                labelText={
                                                    t().auth.reset.newPasswordLabel
                                                }
                                                type="password"
                                                placeholder="••••••••"
                                                value={password()}
                                                onInput={(e) =>
                                                    setPassword(e.currentTarget.value)
                                                }
                                                validate={validatePassword}
                                                required
                                            />

                                            <Input
                                                labelText={
                                                    t().auth.reset.confirmPasswordLabel
                                                }
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword()}
                                                onInput={(e) =>
                                                    setConfirmPassword(
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                error={
                                                    password() &&
                                                    confirmPassword() &&
                                                    password() !== confirmPassword()
                                                        ? t().validation
                                                              .passwordMismatch
                                                        : undefined
                                                }
                                                required
                                            />

                                            <Show when={error()}>
                                                <div
                                                    role="alert"
                                                    class="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error"
                                                >
                                                    {error()}
                                                </div>
                                            </Show>

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                class="mt-2 w-full justify-center"
                                                disabled={loading()}
                                            >
                                                {loading()
                                                    ? t().auth.reset.submitting
                                                    : t().auth.reset.submit}
                                            </Button>
                                        </form>
                                    </>
                                }
                            >
                                <div class="flex flex-col items-center gap-4 py-4 text-center">
                                    <div class="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
                                        <LockIcon />
                                    </div>
                                    <div>
                                        <h2 class="text-xl font-bold text-foreground">
                                            {t().auth.reset.successTitle}
                                        </h2>
                                        <p class="mt-2 text-sm text-muted-foreground">
                                            {t().auth.reset.successDesc}
                                        </p>
                                    </div>
                                    <A href="/login" class="mt-2 w-full">
                                        <Button
                                            variant="primary"
                                            class="w-full justify-center"
                                        >
                                            {t().auth.reset.goToLogin}
                                        </Button>
                                    </A>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
