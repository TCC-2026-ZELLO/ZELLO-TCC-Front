import { A } from "@solidjs/router";
import { ZelloIcon } from "../../components/Icons/Icons";
import { t } from "../../core/i18n";

export function Footer() {
    return (
        <footer class="border-t border-border bg-background pb-8 pt-12 sm:pt-16">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-2">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <ZelloIcon />
                            </div>
                            <span class="text-xl font-bold tracking-tight text-foreground">
                                {t().sidebar.brand}
                            </span>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {t().landing.footer.tagline}
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="mb-1 font-bold text-foreground">
                            {t().landing.footer.forClients}
                        </h4>
                        <A
                            href="/explore"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.searchServices}
                        </A>
                        <A
                            href="/register"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.createAccount}
                        </A>
                        <A
                            href="/mapa"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.helpCenter}
                        </A>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="mb-1 font-bold text-foreground">
                            {t().landing.footer.forBusiness}
                        </h4>
                        <A
                            href="/register"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.registerPro}
                        </A>
                        <A
                            href="/register"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.registerBiz}
                        </A>
                        <a
                            href="#beneficios"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.plans}
                        </a>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="mb-1 font-bold text-foreground">
                            {t().landing.footer.legal}
                        </h4>
                        <a
                            href="#como-funciona"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.terms}
                        </a>
                        <a
                            href="#como-funciona"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.privacy}
                        </a>
                        <a
                            href="#como-funciona"
                            class="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t().landing.footer.cookies}
                        </a>
                    </div>
                </div>

                <div class="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
                    <p class="text-xs text-muted-foreground">
                        {t().landing.footer.rights(new Date().getFullYear())}
                    </p>
                </div>
            </div>
        </footer>
    );
}
