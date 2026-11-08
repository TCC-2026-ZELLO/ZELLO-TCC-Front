import { A, useNavigate } from "@solidjs/router";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { XIcon, ZelloIcon } from "../../components/Icons/Icons";
import { Button } from "../../components/Widgets/Button";
import { LanguageSwitcher } from "../../components/Widgets/LanguageSwitcher";
import { ThemeSwitcher } from "../../components/Widgets/ThemeSwitcher";
import { t } from "../../core/i18n";
import { isAuthenticated } from "../../store/appState";

export function PublicHeader() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = createSignal(false);
    const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

    onMount(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        onCleanup(() => window.removeEventListener("scroll", handleScroll));
    });

    return (
        <header
            class={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
                scrolled() || mobileMenuOpen()
                    ? "border-b border-border bg-background/95 py-3 shadow-sm backdrop-blur-md"
                    : "bg-transparent py-4 sm:py-5"
            }`}
        >
            <div class="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <A href="/" class="group flex items-center gap-2">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105 md:h-10 md:w-10">
                        <ZelloIcon />
                    </div>
                    <span class="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                        {t().sidebar.brand}
                    </span>
                </A>

                <nav class="hidden items-center gap-8 md:flex">
                    <a
                        href="#como-funciona"
                        class="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t().landing.nav.howItWorks}
                    </a>
                    <a
                        href="#beneficios"
                        class="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t().landing.nav.benefits}
                    </a>
                </nav>

                <div class="hidden items-center gap-2.5 md:flex">
                    <LanguageSwitcher compact />
                    <ThemeSwitcher />

                    <Show
                        when={isAuthenticated()}
                        fallback={
                            <>
                                <Button
                                    variant="ghost"
                                    class="text-sm font-semibold"
                                    onClick={() => navigate("/login")}
                                >
                                    {t().landing.nav.login}
                                </Button>
                                <Button
                                    class="text-sm font-bold shadow-md transition-all hover:shadow-lg"
                                    onClick={() => navigate("/register")}
                                >
                                    {t().landing.nav.register}
                                </Button>
                            </>
                        }
                    >
                        <Button
                            class="text-sm font-bold shadow-md transition-all hover:shadow-lg"
                            onClick={() => navigate("/explore")}
                        >
                            {t().landing.nav.goToDashboard}
                        </Button>
                    </Show>
                </div>

                <div class="flex items-center gap-2 md:hidden">
                    <LanguageSwitcher compact />
                    <ThemeSwitcher />
                    <button
                        type="button"
                        aria-label={
                            mobileMenuOpen()
                                ? t().landing.nav.closeMenu
                                : t().landing.nav.openMenu
                        }
                        aria-expanded={mobileMenuOpen()}
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        class="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-secondary"
                    >
                        <Show
                            when={!mobileMenuOpen()}
                            fallback={<XIcon size={18} />}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </Show>
                    </button>
                </div>
            </div>

            <Show when={mobileMenuOpen()}>
                <div class="border-t border-border bg-card px-4 py-4 shadow-lg md:hidden">
                    <nav class="flex flex-col gap-3">
                        <a
                            href="#como-funciona"
                            onClick={() => setMobileMenuOpen(false)}
                            class="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                            {t().landing.nav.howItWorks}
                        </a>
                        <a
                            href="#beneficios"
                            onClick={() => setMobileMenuOpen(false)}
                            class="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                            {t().landing.nav.benefits}
                        </a>
                        <div class="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                            <Show
                                when={isAuthenticated()}
                                fallback={
                                    <>
                                        <Button
                                            variant="outline"
                                            class="w-full justify-center"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                navigate("/login");
                                            }}
                                        >
                                            {t().landing.nav.login}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            class="w-full justify-center"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                navigate("/register");
                                            }}
                                        >
                                            {t().landing.nav.register}
                                        </Button>
                                    </>
                                }
                            >
                                <Button
                                    variant="primary"
                                    class="w-full justify-center"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        navigate("/explore");
                                    }}
                                >
                                    {t().landing.nav.goToDashboard}
                                </Button>
                            </Show>
                        </div>
                    </nav>
                </div>
            </Show>
        </header>
    );
}
