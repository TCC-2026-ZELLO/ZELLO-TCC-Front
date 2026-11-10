import { useNavigate } from "@solidjs/router";
import { createResource, For, Show } from "solid-js";
import { MapPinIcon, SearchIcon, StarIcon } from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import {
    formatDecimal,
    formatMoney,
    formatMoneyHint,
    localizeDomain,
    t,
} from "../core/i18n";
import { searchService } from "../services/search.service";
import { currentUser } from "../store/appState";

function StarRating(props: { value: number }) {
    return (
        <span class="flex items-center gap-0.5">
            <For each={[1, 2, 3, 4, 5]}>
                {(s) => (
                    <StarIcon
                        size={11}
                        class={
                            s <= Math.round(props.value)
                                ? "text-warning"
                                : "text-muted-foreground/30"
                        }
                    />
                )}
            </For>
        </span>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const [recommended] = createResource(searchService.recommended);

    const firstName = () =>
        currentUser()?.name?.split(" ")[0] || t().home.welcomeFallback;

    return (
        <div class="flex flex-col gap-8 p-4 pb-20 sm:p-6 md:gap-10 md:p-8">
            <section class="flex flex-col gap-1">
                <h1 class="text-2xl font-bold text-foreground sm:text-3xl">
                    {t().home.greeting(firstName())}
                </h1>
                <p class="text-muted-foreground">{t().home.subtitle}</p>
            </section>

            <section
                class="flex cursor-pointer items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
                onClick={() => navigate("/explore")}
            >
                <div class="rounded-xl bg-primary/10 p-2">
                    <SearchIcon class="size-5 text-primary" />
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-foreground">
                        {t().home.exploreTitle}
                    </span>
                    <span class="text-xs text-muted-foreground">
                        {t().home.exploreSubtitle}
                    </span>
                </div>
                <span class="ml-auto text-lg text-muted-foreground">→</span>
            </section>

            <section class="flex flex-col gap-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 class="flex items-center gap-2 text-xl font-bold text-foreground">
                            <StarIcon class="size-5 text-warning" />
                            {t().home.recommendedTitle}
                        </h2>
                        <p class="text-sm text-muted-foreground">
                            {t().home.recommendedSubtitle}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/explore?sortBy=trending")}
                        class="text-sm font-semibold text-primary"
                    >
                        {t().home.viewAll}
                    </Button>
                </div>

                <Show
                    when={!recommended.loading}
                    fallback={
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <For each={[1, 2, 3, 4]}>
                                {() => (
                                    <div class="h-56 animate-pulse rounded-2xl border border-border bg-muted" />
                                )}
                            </For>
                        </div>
                    }
                >
                    <Show
                        when={(recommended() ?? []).length > 0}
                        fallback={
                            <div class="rounded-2xl border border-dashed border-border bg-secondary/10 py-12 text-center text-sm text-muted-foreground">
                                {t().home.empty}
                            </div>
                        }
                    >
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <For each={recommended() ?? []}>
                                {(pro) => {
                                    const name =
                                        pro.user?.name ||
                                        pro.name ||
                                        t().appointments.fallback.professional;
                                    const rating = Number(
                                        pro.averageRating ?? pro.rating ?? 5,
                                    );
                                    const coverImg =
                                        pro.bannerUrl ||
                                        pro.photoUrl ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

                                    return (
                                        <Card
                                            class="group flex cursor-pointer flex-col gap-0 overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                                            onClick={() =>
                                                navigate(`/public_profile/${pro.id}`)
                                            }
                                        >
                                            <div class="relative h-36 overflow-hidden rounded-t-lg bg-muted">
                                                <img
                                                    src={coverImg}
                                                    alt={name}
                                                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=808080&color=fff`;
                                                    }}
                                                />
                                                <div class="absolute left-2 top-2 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold text-warning-foreground shadow">
                                                    {t().home.recommendedBadge}
                                                </div>
                                                <div class="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-border/40 bg-background/95 px-2 py-1 text-xs font-black text-foreground shadow backdrop-blur-md">
                                                    <StarIcon class="size-3 text-warning" />
                                                    {formatDecimal(rating)}
                                                </div>
                                                <Show when={pro.minPrice != null}>
                                                    <div
                                                        class="absolute bottom-2 left-2 rounded-lg bg-success px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow"
                                                        title={
                                                            formatMoneyHint(
                                                                Number(pro.minPrice),
                                                            ) ?? undefined
                                                        }
                                                    >
                                                        {t().home.startingAt(
                                                            formatMoney(
                                                                Number(pro.minPrice),
                                                            ),
                                                        )}
                                                    </div>
                                                </Show>
                                            </div>

                                            <div class="flex flex-col gap-1 p-3">
                                                <span class="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                                                    {name}
                                                </span>
                                                <span class="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {localizeDomain.specialty(
                                                        pro.specialty ||
                                                            t().publicProfile
                                                                .defaultSpecialty,
                                                    )}
                                                </span>
                                                <div class="mt-1 flex items-center justify-between">
                                                    <StarRating value={rating} />
                                                    <div class="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <MapPinIcon class="size-2.5" />
                                                        {pro.city || "Curitiba"}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                }}
                            </For>
                        </div>
                    </Show>
                </Show>
            </section>
        </div>
    );
}
