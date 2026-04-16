import {createSignal, For, Show} from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Tabs } from "~/components/Widgets/Tabs";
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from "~/components/Icons/Icons";

export default function PublicProfile() {
    const [activeTab, setActiveTab] = createSignal("servicos");

    const profData = {
        name: "André Agostini",
        role: "Hair Stylist & Colorista",
        rating: 4.9,
        reviewsCount: 124,
        bio: "Especialista em colorimetria e cortes modernos com mais de 5 anos de experiência. Foco em saúde capilar e visagismo para entregar o resultado perfeito para o seu rosto.",
        location: "Studio Zello Beauty - Centro",
        services: [
            { id: 1, name: "Corte Completo", duration: "1h", price: "R$ 80,00" },
            { id: 2, name: "Coloração Global", duration: "2h 30m", price: "R$ 250,00" },
            { id: 3, name: "Combo: Corte + Hidratação", duration: "1h 30m", price: "R$ 130,00" }, // RF11
        ],
        portfolio: [1, 2, 3, 4, 5, 6] // Mock IDs de imagens
    };

    return (
        <div class="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-8 pb-20 md:py-8">

            {/* Header / Apresentação */}
            <Card class="overflow-hidden border-none shadow-sm bg-card relative">
                {/* Banner */}
                <div class="h-48 w-full bg-gradient-to-r from-primary/80 to-primary object-cover" />

                <div class="px-6 pb-6 pt-0 relative sm:px-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16 sm:-mt-12">
                    <img
                        src="https://i.pravatar.cc/250?img=11"
                        alt="Profile"
                        class="size-32 sm:size-40 rounded-2xl object-cover border-4 border-background shadow-md bg-background"
                    />

                    <div class="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left pt-2 pb-2">
                        <h1 class="text-3xl font-bold text-foreground flex items-center gap-2">
                            {profData.name}
                            <span class="text-primary" title="Perfil Verificado"> <CheckCircleIcon/> </span>
                        </h1>
                        <p class="text-lg text-muted-foreground font-medium">{profData.role}</p>

                        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                            <div class="flex items-center gap-1 font-semibold text-foreground">
                                <span class="text-yellow-500"> <StarIcon/> </span> {profData.rating}
                                <span class="text-muted-foreground font-normal">({profData.reviewsCount} avaliações)</span>
                            </div>
                            <div class="flex items-center gap-1 text-muted-foreground">
                                <MapPinIcon/> {profData.location}
                            </div>
                        </div>
                    </div>

                    <div class="w-full sm:w-auto">
                        <Button variant="primary" class="w-full sm:w-auto py-3 px-8 text-base shadow-lg">
                            <CalendarIcon/> Agendar Agora
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Layout Principal Duas Colunas */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna Esquerda: Sobre e Certificados */}
                <div class="flex flex-col gap-6 lg:col-span-1">
                    <Card class="p-6">
                        <h3 class="font-bold text-lg text-foreground mb-3">Sobre</h3>
                        <p class="text-muted-foreground text-sm leading-relaxed">
                            {profData.bio}
                        </p>
                    </Card>

                    <Card class="p-6">
                        <h3 class="font-bold text-lg text-foreground mb-4">Certificados Técnicos</h3>
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                                <div class="size-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">W</div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-semibold text-foreground">Master Colorimetria</span>
                                    <span class="text-xs text-muted-foreground">Wella Professionals - 2024</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Coluna Direita: Tabs de Conteúdo */}
                <div class="flex flex-col gap-6 lg:col-span-2">
                    <div class="border-b border-border">
                        <Tabs
                            activeValue={activeTab()}
                            onChange={(val) => setActiveTab(val as string)}
                            items={[
                                { label: "Serviços", value: "servicos" },
                                { label: "Portfólio", value: "portfolio" },
                                { label: "Avaliações", value: "avaliacoes" }
                            ]}
                        />
                    </div>

                    {/* Conteúdo Dinâmico das Tabs */}
                    <div class="py-2">
                        {/* TAB: SERVIÇOS */}
                        <Show when={activeTab() === "servicos"}>
                            <div class="flex flex-col gap-3 animate-in fade-in duration-300">
                                <For each={profData.services}>
                                    {(svc) => (
                                        <div class="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                                            <div class="flex flex-col">
                                                <span class="font-bold text-foreground group-hover:text-primary transition-colors">{svc.name}</span>
                                                <span class="text-sm text-muted-foreground">{svc.duration}</span>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <span class="font-semibold text-foreground">{svc.price}</span>
                                                <Button variant="outline" class="rounded-full text-xs px-4">Reservar</Button>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>

                        {/* TAB: PORTFÓLIO */}
                        <Show when={activeTab() === "portfolio"}>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                                <For each={profData.portfolio}>
                                    {(img) => (
                                        <div class="aspect-square rounded-xl bg-secondary overflow-hidden group cursor-pointer">
                                            <img
                                                src={`https://source.unsplash.com/random/300x300/?hair,salon&sig=${img}`}
                                                alt="Trabalho de portfólio"
                                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
}