import { createSignal, createResource, For, Show, createEffect } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { SearchIcon, MapPinIcon, StarIcon, FilterIcon } from "~/components/Icons/Icons";
import { useNavigate } from "@solidjs/router";
import { searchService } from "~/services/search.service";

export default function Explore() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = createSignal("");
    const [debouncedQuery, setDebouncedQuery] = createSignal("");
    const [searchType, setSearchType] = createSignal<"professionals" | "establishments">("professionals");

    createEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery());
        }, 500);
        return () => clearTimeout(timer);
    });

    const [results] = createResource(
        () => ({ type: searchType(), q: debouncedQuery() }),
        async ({ type, q }) => {
            const res = type === "professionals"
                ? await searchService.professionals(q)
                : await searchService.businesses(q);
            return res.data || [];
        }
    );

    return (
        <div class="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
            <div class="flex flex-col gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-foreground font-display tracking-tight">Descubra Serviços</h1>
                    <p class="text-sm text-muted-foreground font-medium">Encontre os melhores especialistas em beleza e bem-estar.</p>
                </div>

                <div class="flex bg-secondary/50 p-1.5 rounded-xl w-fit border border-border/50">
                    <button
                        class={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${searchType() === 'professionals' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setSearchType('professionals')}
                    >
                        Profissionais
                    </button>
                    <button
                        class={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${searchType() === 'establishments' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setSearchType('establishments')}
                    >
                        Estabelecimentos
                    </button>
                </div>
            </div>

            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="relative w-full md:w-96">
                    <span class="absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
                        <SearchIcon class="size-4" />
                    </span>
                    <input
                        type="text"
                        placeholder={searchType() === 'professionals' ? "Buscar por nome ou especialidade..." : "Buscar salão, barbearia..."}
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.currentTarget.value)}
                        class="w-full rounded-xl border border-input bg-card py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <Button variant="outline" class="rounded-xl px-5 border-border">
                    <FilterIcon class="size-4 mr-2" /> Filtros
                </Button>
            </div>

            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4 items-start mt-4">
                <div class="col-span-1 hidden lg:flex flex-col overflow-hidden rounded-2xl border border-border bg-card h-[600px] sticky top-8 shadow-sm">
                    <div class="bg-secondary/30 w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                        <MapPinIcon class="size-10 mb-3 opacity-20" />
                        <span class="font-bold text-foreground">Mapa Interativo</span>
                        <p class="text-xs mt-2">Visualize os profissionais ao seu redor</p>
                    </div>
                </div>

                <div class="col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2 xl:col-span-3">
                    <Show when={!results.loading} fallback={
                        <For each={[1, 2, 3, 4]}>
                            {() => <div class="h-64 rounded-2xl bg-muted animate-pulse border border-border"></div>}
                        </For>
                    }>
                        <For each={results()}>
                            {(item: any) => {
                                const isProf = searchType() === "professionals";
                                const name = isProf ? item.user?.name : item.tradeName;
                                const specialty = isProf ? (item.specialty || "Especialista") : "Estabelecimento";

                                const coverImg = isProf
                                    ? (item.bannerUrl || item.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`)
                                    : (item.bannerUrl || item.logoUrl || `https://placehold.co/400x300?text=${encodeURIComponent(name)}`);

                                return (
                                    <Card
                                        class="flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-primary/40 group border-border/60"
                                        onClick={() => {
                                            isProf
                                                ? navigate(`/public_profile/${item.id}`)
                                                : navigate(`/business_profile/${item.id}`)
                                        }}
                                    >
                                        <div class="h-40 bg-muted relative overflow-hidden">
                                            <img
                                                src={coverImg}
                                                alt={name}
                                                class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                                onerror={(e) => {
                                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=808080&color=fff`;
                                                }}
                                            />
                                            <div class="absolute top-4 right-4 bg-background/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black text-foreground shadow-lg border border-border/50">
                                                <StarIcon class="size-3.5 text-yellow-500" /> {item.rating || "5.0"}
                                            </div>
                                        </div>

                                        <div class="p-5 flex flex-col gap-2">
                                            <div class="flex justify-between items-start">
                                                <h3 class="font-bold text-foreground text-lg truncate pr-2 leading-tight">
                                                    {name}
                                                </h3>
                                                <Show when={item.price}>
                                                    <span class="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md shrink-0">
                                                        R$ {item.price}
                                                    </span>
                                                </Show>
                                            </div>

                                            <p class="text-sm text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                                                {specialty}
                                            </p>

                                            <div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 font-medium">
                                                <MapPinIcon class="size-3.5 opacity-60" />
                                                {item.city || "Curitiba"} • {item.distance || "1.2 km"}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            }}
                        </For>
                    </Show>

                    <Show when={!results.loading && results()?.length === 0}>
                        <div class="col-span-full py-24 text-center flex flex-col items-center gap-4 bg-secondary/10 rounded-3xl border border-dashed border-border">
                            <div class="size-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
                                <SearchIcon class="size-8" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <p class="text-foreground font-bold text-lg">Nenhum resultado</p>
                                <p class="text-muted-foreground text-sm">Tente ajustar seus filtros ou mudar o termo da busca.</p>
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
}