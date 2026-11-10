import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";
import {
    BriefcaseIcon,
    CheckCircleIcon,
    HeartIcon,
} from "../../components/Icons/Icons";
import { Button } from "../../components/Widgets/Button";
import { t } from "../../core/i18n";

export function Benefits() {
    const navigate = useNavigate();

    return (
        <section id="beneficios" class="py-16 sm:py-24">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div class="relative flex min-h-[340px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 to-secondary/30 p-6 sm:h-[460px] sm:p-8">
                        <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                        <div class="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

                        <div class="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-500 sm:-rotate-2 sm:hover:rotate-0">
                            <div class="flex items-center gap-4 border-b border-border/50 pb-4">
                                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <BriefcaseIcon class="size-6 text-primary" />
                                </div>
                                <div>
                                    <h4 class="font-bold text-foreground">
                                        {t().landing.benefits.cardTitle}
                                    </h4>
                                    <p class="text-xs text-muted-foreground">
                                        {t().landing.benefits.cardSubtitle}
                                    </p>
                                </div>
                            </div>
                            <ul class="space-y-3">
                                <For each={t().landing.benefits.items}>
                                    {(item) => (
                                        <li class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <CheckCircleIcon class="size-4 shrink-0 text-primary" />{" "}
                                            {item}
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div class="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                            <HeartIcon class="size-4" /> {t().landing.benefits.badge}
                        </div>

                        <h2 class="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
                            {t().landing.benefits.titlePrefix}{" "}
                            <span class="text-primary">
                                {t().landing.benefits.titleHighlight}
                            </span>
                            .
                        </h2>

                        <p class="text-base text-muted-foreground sm:text-lg">
                            {t().landing.benefits.description}
                        </p>

                        <div class="mt-2 flex items-center gap-4">
                            <Button
                                size="lg"
                                class="w-full justify-center px-8 font-bold shadow-xl hover:shadow-primary/30 sm:w-auto"
                                onClick={() => navigate("/register")}
                            >
                                {t().landing.benefits.cta}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
