import { createResource, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { StarIcon, MapPinIcon, SearchIcon } from "~/components/Icons/Icons";
import { searchService } from "~/services/search.service";
import { currentUser } from "~/store/appState";

function StarRating(props: { value: number }) {
    return (
        <span class="flex items-center gap-0.5">
            <For each={[1, 2, 3, 4, 5]}>
                {(s) => (
                    <StarIcon
                        size={11}
                        class={s <= Math.round(props.value) ? "text-yellow-500" : "text-muted-foreground/30"}
                    />
                )}
            </For>
        </span>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const user = currentUser();

    const [recommended] = createResource(searchService.recommended);

    return (
        <div class="flex flex-col gap-10 p-4 md:p-8 pb-20 animate-in fade-in duration-500">

            <section class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold text-foreground">
                    Olá, {user?.name?.split(" ")[0] || "bem-vindo"} 👋
                </h1>
                <p class="text-muted-foreground">Encontre os melhores profissionais para você.</p>
            </section>

            <section
                class="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => navigate("/explore")}
            >
                <div class="p-2 bg-primary/10 rounded-xl">
                    <SearchIcon class="size-5 text-primary" />
                </div>
                <div class="flex flex-col">
                    <span class="font-semibold text-foreground text-sm">Explorar serviços</span>
                    <span class="text-xs text-muted-foreground">Busque por nome, especialidade ou filtros</span>
                </div>
                <span class="ml-auto text-muted-foreground text-lg">→</span>
            </section>

            <section class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
                            ⭐ Recomendados
                        </h2>
                        <p class="text-sm text-muted-foreground">Profissionais com as melhores avaliações no Zello.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/explore?sortBy=trending")} class="text-primary text-sm font-semibold">
                        Ver todos →
                    </Button>
                </div>

                <Show
                    when={!recommended.loading}
                    fallback={
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <For each={[1, 2, 3, 4]}>
                                {() => <div class="h-56 rounded-2xl bg-muted animate-pulse border border-border" />}
                            </For>
                        </div>
                    }
                >
                    <Show
                        when={(recommended()?.data ?? recommended() ?? []).length > 0}
                        fallback={
                            <div class="py-12 text-center rounded-2xl border border-dashed border-border bg-secondary/10 text-muted-foreground text-sm">
                                Nenhum profissional disponível no momento.
                            </div>
                        }
                    >
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <For each={recommended()?.data ?? recommended() ?? []}>
                                {(pro: any) => {
                                    const name     = pro.user?.name || "Profissional";
                                    const coverImg = pro.bannerUrl || pro.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

                                    return (
                                        <Card
                                            class="flex flex-col overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 transition-all group border-border/60 gap-0 p-0"
                                            onClick={() => navigate(`/public_profile/${pro.id}`)}
                                        >
                                            <div class="h-36 bg-muted relative overflow-hidden rounded-t-lg">
                                                <img
                                                    src={coverImg}
                                                    alt={name}
                                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onerror={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=808080&color=fff`; }}
                                                />
                                                <div class="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                                    Recomendado
                                                </div>
                                                <div class="absolute top-2 right-2 bg-background/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-black shadow border border-border/40">
                                                    <StarIcon class="size-3 text-yellow-500" />
                                                    {Number(pro.rating ?? 5).toFixed(1)}
                                                </div>
                                                <Show when={pro.minPrice != null}>
                                                    <div class="absolute bottom-2 left-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow">
                                                        a partir de R$ {Number(pro.minPrice).toFixed(2)}
                                                    </div>
                                                </Show>
                                            </div>

                                            <div class="p-3 flex flex-col gap-1">
                                                <span class="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                    {name}
                                                </span>
                                                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                                    {pro.specialty || "Especialista"}
                                                </span>
                                                <div class="flex items-center justify-between mt-1">
                                                    <StarRating value={pro.rating ?? 5} />
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
