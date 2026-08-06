import { createSignal, createResource, For, Show, createEffect } from "solid-js";
import { Card } from "../components/Widgets/Card";
import { SearchIcon, MapPinIcon, StarIcon, FilterIcon } from "../components/Icons/Icons";
import { useNavigate } from "@solidjs/router";
import { searchService, SortBy } from "../services/search.service";


const SORT_OPTIONS: { value: SortBy; label: string; icon: string }[] = [
    { value: "default",   label: "Relevância",  icon: "🎯" },
    { value: "trending",  label: "Trending",    icon: "⭐" },
    { value: "price_asc", label: "Menor Preço", icon: "💰" },
];

const RATING_OPTIONS = [5, 4, 3] as const;

function StarRating(props: { value: number }) {
    return (
        <span class="flex items-center gap-0.5">
            <For each={[1, 2, 3, 4, 5]}>
                {(s) => (
                    <StarIcon
                        size={12}
                        class={s <= Math.round(props.value) ? "text-yellow-500" : "text-muted-foreground/30"}
                    />
                )}
            </For>
        </span>
    );
}


export default function Explore() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery]       = createSignal("");
    const [debouncedQuery, setDebouncedQuery] = createSignal("");
    const [searchType, setSearchType]         = createSignal<"professionals" | "establishments">("professionals");

    createEffect(() => {
        const q = searchQuery();
        const timer = setTimeout(() => setDebouncedQuery(q), 500);
        return () => clearTimeout(timer);
    });

    const [sortBy, setSortBy]         = createSignal<SortBy>("default");
    const [minRating, setMinRating]   = createSignal<number | undefined>(undefined);
    const [maxPrice, setMaxPrice]     = createSignal("");
    const [showFilters, setShowFilters] = createSignal(false);

    const activeFilterCount = () =>
        (sortBy() !== "default" ? 1 : 0) +
        (minRating() !== undefined ? 1 : 0) +
        (maxPrice() !== "" ? 1 : 0);

    const hasActiveFilters = () => activeFilterCount() > 0;

    const clearFilters = () => {
        setSortBy("default");
        setMinRating(undefined);
        setMaxPrice("");
    };

    const [results] = createResource(
        () => ({
            type:      searchType(),
            q:         debouncedQuery(),
            sortBy:    sortBy(),
            minRating: minRating(),
            maxPrice:  maxPrice() ? Number(maxPrice()) : undefined,
        }),
        async ({ type, q, sortBy, minRating, maxPrice }) => {
            if (type === "establishments") {
                const res = await searchService.businesses(q);
                return res.data || [];
            }
            const res = await searchService.professionals(q, { sortBy, minRating, maxPrice });
            return res.data || [];
        }
    );


    return (
        <div class="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">

            <div class="flex flex-col gap-3">
                <div>
                    <h1 class="text-3xl font-bold text-foreground tracking-tight">Descubra Serviços</h1>
                    <p class="text-sm text-muted-foreground">Encontre os melhores especialistas em beleza e bem-estar.</p>
                </div>

                <div class="flex bg-secondary/50 p-1.5 rounded-xl w-fit border border-border/50">
                    <button
                        class={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${searchType() === "professionals" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setSearchType("professionals")}
                    >
                        Profissionais
                    </button>
                    <button
                        class={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${searchType() === "establishments" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setSearchType("establishments")}
                    >
                        Estabelecimentos
                    </button>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
                <div class="relative w-full md:w-96">
                    <span class="absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
                        <SearchIcon class="size-4" />
                    </span>
                    <input
                        type="text"
                        placeholder={searchType() === "professionals" ? "Buscar por nome ou especialidade..." : "Buscar salão, barbearia..."}
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.currentTarget.value)}
                        class="w-full rounded-xl border border-input bg-card py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(v => !v)}
                    class={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all
                        ${showFilters()
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary"}`}
                >
                    <FilterIcon class="size-4" />
                    Filtros
                    <Show when={activeFilterCount() > 0}>
                        <span class="size-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                            {activeFilterCount()}
                        </span>
                    </Show>
                </button>

                <Show when={hasActiveFilters()}>
                    <button
                        onClick={clearFilters}
                        class="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                        Limpar filtros
                    </button>
                </Show>
            </div>

            <Show when={showFilters() && searchType() === "professionals"}>
                <Card class="p-5 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200 border-primary/20">

                    <div class="flex flex-col gap-2">
                        <span class="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Ordenar por</span>
                        <div class="flex flex-wrap gap-2">
                            <For each={SORT_OPTIONS}>
                                {(opt) => (
                                    <button
                                        onClick={() => setSortBy(opt.value)}
                                        class={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all
                                            ${sortBy() === opt.value
                                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                : "bg-secondary/50 text-foreground border-border hover:border-primary/60"}`}
                                    >
                                        <span>{opt.icon}</span> {opt.label}
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row gap-6">
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Avaliação mínima</span>
                            <div class="flex items-center gap-2">
                                <For each={RATING_OPTIONS}>
                                    {(r) => (
                                        <button
                                            onClick={() => setMinRating(minRating() === r ? undefined : r)}
                                            class={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all
                                                ${minRating() === r
                                                    ? "bg-yellow-500 text-white border-yellow-500 shadow-sm"
                                                    : "bg-secondary/50 text-foreground border-border hover:border-yellow-400"}`}
                                        >
                                            <StarIcon size={12} class={minRating() === r ? "text-white" : "text-yellow-500"} />
                                            {r}+
                                        </button>
                                    )}
                                </For>
                                <Show when={minRating() !== undefined}>
                                    <button onClick={() => setMinRating(undefined)} class="text-xs text-muted-foreground hover:text-foreground underline ml-1">
                                        limpar
                                    </button>
                                </Show>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Preço máximo (R$)</span>
                            <div class="flex items-center gap-2">
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm font-semibold pointer-events-none">R$</span>
                                    <input
                                        type="number"
                                        placeholder="Ex: 150"
                                        value={maxPrice()}
                                        onInput={(e) => setMaxPrice(e.currentTarget.value)}
                                        class="w-36 rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        min="0"
                                    />
                                </div>
                                <Show when={maxPrice() !== ""}>
                                    <button onClick={() => setMaxPrice("")} class="text-xs text-muted-foreground hover:text-foreground underline">
                                        limpar
                                    </button>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Card>
            </Show>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <Show
                    when={!results.loading}
                    fallback={
                        <For each={[1, 2, 3, 4]}>
                            {() => <div class="h-64 rounded-2xl bg-muted animate-pulse border border-border" />}
                        </For>
                    }
                >
                    <For each={results()}>
                        {(item: any) => {
                            const isProf   = searchType() === "professionals";
                            const name     = isProf ? item.user?.name : (item.name || item.tradeName);
                            const specialty = isProf ? (item.specialty || "Especialista") : "Estabelecimento";
                            const coverImg = isProf
                                ? (item.bannerUrl?.trim() || item.photoUrl?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`)
                                : (item.bannerUrl?.trim() || item.photoUrl?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`);
                            return (
                                <Card
                                    class="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-primary/40 group border-border/60 gap-0 p-0"
                                    onClick={() => isProf ? navigate(`/public_profile/${item.id}`) : navigate(`/business_profile/${item.id}`)}
                                >
                                    <div class="h-40 bg-muted relative overflow-hidden rounded-t-lg">
                                        <img
                                            src={coverImg}
                                            alt={name}
                                            class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                            onerror={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=808080&color=fff`; }}
                                        />
                                        {/* Badge rating */}
                                        <div class="absolute top-3 right-3 bg-background/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-black shadow border border-border/50">
                                            <StarIcon class="size-3 text-yellow-500" />
                                            {Number(item.rating ?? 5).toFixed(1)}
                                        </div>
                                        {/* Badge preço */}
                                        <Show when={item.minPrice != null}>
                                            <div class="absolute bottom-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold shadow">
                                                a partir de R$ {Number(item.minPrice).toFixed(2)}
                                            </div>
                                        </Show>
                                    </div>

                                    <div class="p-4 flex flex-col gap-1.5">
                                        <h3 class="font-bold text-foreground text-base truncate leading-tight group-hover:text-primary transition-colors">
                                            {name}
                                        </h3>
                                        <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {specialty}
                                        </p>
                                        <div class="flex items-center gap-1.5 mt-1.5">
                                            <StarRating value={item.rating ?? 5} />
                                            <span class="text-xs text-muted-foreground">{Number(item.rating ?? 5).toFixed(1)}</span>
                                        </div>
                                        <div class="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <MapPinIcon class="size-3 opacity-60" />
                                            {item.city || "Curitiba"}
                                        </div>
                                    </div>
                                </Card>
                            );
                        }}
                    </For>
                </Show>

                <Show when={!results.loading && (results()?.length ?? 0) === 0}>
                    <div class="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-secondary/10 rounded-3xl border border-dashed border-border">
                        <div class="size-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <SearchIcon class="size-8" />
                        </div>
                        <div>
                            <p class="text-foreground font-bold text-lg">Nenhum resultado</p>
                            <p class="text-muted-foreground text-sm">Tente ajustar seus filtros ou mudar o termo da busca.</p>
                        </div>
                        <Show when={hasActiveFilters()}>
                            <button onClick={clearFilters} class="text-sm text-primary underline font-semibold">
                                Limpar filtros e tentar novamente
                            </button>
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    );
}
