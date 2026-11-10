import { For } from "solid-js";
import { CalendarIcon, SearchIcon, StarIcon } from "../../components/Icons/Icons";
import { t } from "../../core/i18n";

export function HowItWorks() {
    const steps = () => [
        {
            icon: <SearchIcon class="size-8 text-primary" />,
            title: t().landing.howItWorks.steps.searchTitle,
            description: t().landing.howItWorks.steps.searchDesc,
        },
        {
            icon: <StarIcon class="size-8 text-primary" />,
            title: t().landing.howItWorks.steps.chooseTitle,
            description: t().landing.howItWorks.steps.chooseDesc,
        },
        {
            icon: <CalendarIcon class="size-8 text-primary" />,
            title: t().landing.howItWorks.steps.bookTitle,
            description: t().landing.howItWorks.steps.bookDesc,
        },
    ];

    return (
        <section id="como-funciona" class="bg-secondary/20 py-16 sm:py-24">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="mb-12 text-center sm:mb-16">
                    <h2 class="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
                        {t().landing.howItWorks.title}
                    </h2>
                    <p class="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                        {t().landing.howItWorks.subtitle}
                    </p>
                </div>

                <div class="relative grid grid-cols-1 gap-10 md:grid-cols-3">
                    <div class="absolute left-1/6 right-1/6 top-12 -z-10 hidden h-0.5 bg-border/60 md:block" />

                    <For each={steps()}>
                        {(step, index) => (
                            <div class="group relative flex flex-col items-center text-center">
                                <div class="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-card shadow-xl transition-transform duration-300 group-hover:scale-105">
                                    {step.icon}
                                    <div class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-black text-background shadow-md">
                                        {index() + 1}
                                    </div>
                                </div>
                                <h3 class="mb-2 text-xl font-bold text-foreground">
                                    {step.title}
                                </h3>
                                <p class="text-muted-foreground">{step.description}</p>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </section>
    );
}
