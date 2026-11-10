import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { MapPinIcon, SearchIcon } from "../../components/Icons/Icons";
import { Button } from "../../components/Widgets/Button";
import { t } from "../../core/i18n";

export function Hero() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = createSignal("");
    const [searchType, setSearchType] = createSignal<
        "professionals" | "establishments"
    >("professionals");

    const handleSearch = (e: Event) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery()) params.set("q", searchQuery());
        params.set("type", searchType());
        navigate(`/explore?${params.toString()}`);
    };

    return (
        <section class="relative overflow-hidden pb-16 pt-28 sm:pt-32 md:pb-32 md:pt-44">
            <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
            <div class="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 opacity-50 blur-3xl sm:h-[800px] sm:w-[800px]" />

            <div class="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
                <h1 class="mb-6 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                    {t().landing.hero.titlePrefix}{" "}
                    <span class="text-primary">{t().landing.hero.titleHighlight}</span>{" "}
                    {t().landing.hero.titleSuffix}
                </h1>

                <p class="mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                    {t().landing.hero.subtitle}
                </p>

                <div class="flex w-full max-w-3xl flex-col gap-4 rounded-3xl border border-border/50 bg-card p-3 shadow-2xl md:p-4">
                    <div class="flex flex-wrap items-center gap-2 px-2">
                        <button
                            type="button"
                            class={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                                searchType() === "professionals"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-secondary/50"
                            }`}
                            onClick={() => setSearchType("professionals")}
                        >
                            {t().landing.hero.tabProfessionals}
                        </button>
                        <button
                            type="button"
                            class={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                                searchType() === "establishments"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-secondary/50"
                            }`}
                            onClick={() => setSearchType("establishments")}
                        >
                            {t().landing.hero.tabEstablishments}
                        </button>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        class="flex w-full flex-col items-stretch gap-3 md:flex-row md:items-center"
                    >
                        <div class="relative w-full flex-1">
                            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                                <SearchIcon class="size-5" />
                            </div>
                            <input
                                type="text"
                                placeholder={
                                    searchType() === "professionals"
                                        ? t().landing.hero.placeholderPro
                                        : t().landing.hero.placeholderBiz
                                }
                                class="w-full rounded-2xl border border-border bg-secondary/30 py-3.5 pl-12 pr-4 font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                                value={searchQuery()}
                                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            />
                        </div>
                        <div class="relative hidden w-1/3 md:block">
                            <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                                <MapPinIcon class="size-5" />
                            </div>
                            <input
                                type="text"
                                placeholder={t().landing.hero.nearYou}
                                disabled
                                class="w-full cursor-not-allowed rounded-2xl border border-transparent bg-secondary/30 py-3.5 pl-12 pr-4 font-medium text-foreground opacity-60 outline-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            class="w-full justify-center rounded-2xl px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:shadow-primary/25 md:w-auto"
                        >
                            {t().landing.hero.searchBtn}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
