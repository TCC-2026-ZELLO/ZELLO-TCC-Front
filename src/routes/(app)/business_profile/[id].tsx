import {createSignal, For, Show, createResource} from "solid-js";
import {useParams, useNavigate} from "@solidjs/router";
import {Card} from "~/components/Widgets/Card";
import {Button} from "~/components/Widgets/Button";
import {Tabs} from "~/components/Widgets/Tabs";
import {StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon} from "~/components/Icons/Icons";
import {businessService} from "~/services/business.service";

export default function EstablishmentProfile() {
    const params = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = createSignal("services");

    const [business] = createResource(
        () => params.id,
        businessService.getById
    );

    const [team] = createResource(
        () => params.id,
        businessService.getTeam
    );

    const [catalog] = createResource(
        () => params.id,
        businessService.getCatalog
    );

    return (
        <Show when={!business.loading} fallback={
            <div class="p-20 text-center animate-pulse text-muted-foreground flex flex-col items-center gap-4">
                <div class="size-12 border-4 border-t-primary border-border rounded-full animate-spin"/>
                Carregando informações do estabelecimento...
            </div>
        }>
            <div class="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-8 pb-20 md:py-8 animate-in fade-in duration-500">

                {/* --- HEADER CARD --- */}
                <Card class="overflow-hidden border-none shadow-sm bg-card relative">
                    {/* BANNER REAL DA EMPRESA */}
                    <div class="h-48 w-full bg-secondary relative">
                        <Show when={business()?.bannerUrl} fallback={
                            <div class="w-full h-full bg-gradient-to-br from-[#1A2B42] to-primary/40"/>
                        }>
                            <img
                                src={business()?.bannerUrl}
                                alt="Capa do estabelecimento"
                                class="w-full h-full object-cover"
                            />
                        </Show>
                        <div class="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"/>
                    </div>

                    <div
                        class="px-6 pb-6 pt-0 relative sm:px-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16 sm:-mt-12">
                        {/* LOGO REAL DA EMPRESA (photoUrl) */}
                        <div
                            class="size-32 sm:size-40 rounded-2xl border-4 border-background shadow-md bg-card flex items-center justify-center overflow-hidden">
                            <Show when={business()?.photoUrl} fallback={
                                <span class="text-5xl font-black text-primary/20 select-none">
                                    {business()?.tradeName?.charAt(0)}
                                </span>
                            }>
                                <img src={business()?.photoUrl} class="w-full h-full object-cover"/>
                            </Show>
                        </div>

                        <div
                            class="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left pt-2 pb-2">
                            <h1 class="text-3xl font-bold text-foreground flex items-center gap-2">
                                {business()?.tradeName}
                                <Show when={business()?.visibilityStatus}>
                                    <span class="text-primary" title="Estabelecimento Verificado">
                                        <CheckCircleIcon class="size-6"/>
                                    </span>
                                </Show>
                            </h1>
                            <p class="text-lg text-muted-foreground font-medium">
                                {business()?.segment || "Estética e Bem-estar"}
                            </p>

                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                                <div class="flex items-center gap-1 font-semibold text-foreground">
                                    <span class="text-yellow-500"><StarIcon class="size-5"/></span>
                                    {business()?.rating || "4.9"}
                                    <span class="text-muted-foreground font-normal ml-1">(Avaliações)</span>
                                </div>
                                <div class="flex items-center gap-1 text-muted-foreground">
                                    <MapPinIcon class="size-4"/>
                                    {/* Caso não tenha endereço ainda, mostra a cidade padrão ou um fallback */}
                                    {business()?.city || "Curitiba - PR"}
                                </div>
                            </div>
                        </div>

                        <div class="w-full sm:w-auto">
                            <Button variant="primary"
                                    class="w-full sm:w-auto py-3 px-8 text-base shadow-lg flex items-center justify-center gap-2">
                                <CalendarIcon class="size-5"/> Agendar
                            </Button>
                        </div>
                    </div>
                </Card>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- COLUNA LATERAL --- */}
                    <div class="flex flex-col gap-6 lg:col-span-1">
                        <Card class="p-6">
                            <h3 class="font-bold text-lg text-foreground mb-3">Sobre Nós</h3>
                            <p class="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                {business()?.description || "Este estabelecimento ainda não forneceu uma descrição detalhada."}
                            </p>
                        </Card>

                        {/* Status de Funcionamento */}
                        <Card class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-lg text-foreground">Horários</h3>
                                <Show when={business()?.profileComplete} fallback={
                                    <span
                                        class="text-[10px] bg-secondary px-2 py-1 rounded-full uppercase">Sob Consulta</span>
                                }>
                                    <span
                                        class="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">Aberto</span>
                                </Show>
                            </div>
                            <p class="text-xs text-muted-foreground">Confira as janelas disponíveis diretamente no
                                processo de agendamento.</p>
                        </Card>
                    </div>

                    {/* --- COLUNA PRINCIPAL --- */}
                    <div class="flex flex-col gap-6 lg:col-span-2">
                        <div class="border-b border-border">
                            <Tabs
                                activeValue={activeTab()}
                                onChange={(val) => setActiveTab(val as string)}
                                items={[
                                    {label: "Serviços", value: "services"},
                                    {label: "Equipe", value: "team"},
                                    {label: "Galeria", value: "gallery"}
                                ]}
                            />
                        </div>

                        <div class="py-2">
                            {/* TAB: SERVIÇOS */}
                            <Show when={activeTab() === "services"}>
                                <div class="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Show when={catalog()?.length > 0} fallback={
                                        <div
                                            class="p-10 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                                            Nenhum serviço disponível no catálogo virtual.
                                        </div>
                                    }>
                                        <For each={catalog()}>
                                            {(svc) => (
                                                <div
                                                    class="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group">
                                                    <div class="flex flex-col">
                                                        <span
                                                            class="font-bold text-foreground group-hover:text-primary transition-colors">{svc.name}</span>
                                                        <span
                                                            class="text-sm text-muted-foreground">{svc.durationMinutes} min</span>
                                                    </div>
                                                    <div class="flex items-center gap-4">
                                                        <span
                                                            class="font-semibold text-foreground">R$ {svc.price}</span>
                                                        <Button variant="outline"
                                                                class="rounded-full text-xs px-4">Selecionar</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: EQUIPE (PROFISSIONAIS REAIS VINCULADOS) */}
                            <Show when={activeTab() === "team"}>
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Show when={team()?.length > 0} fallback={
                                        <div class="col-span-full p-10 text-center text-muted-foreground">Nenhum
                                            profissional listado publicamente.</div>
                                    }>
                                        <For each={team()}>
                                            {(link: any) => {
                                                const member = link.professional;
                                                return (
                                                    <Card
                                                        class="p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all"
                                                        onClick={() => navigate(`/public_profile/${member.id}`)}
                                                    >
                                                        <img
                                                            src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.user?.name}&background=random`}
                                                            alt={member.user?.name}
                                                            class="size-16 rounded-full object-cover border border-border"
                                                        />
                                                        <div class="flex flex-col flex-1 overflow-hidden">
                                                            <span
                                                                class="font-bold text-foreground truncate">{member.user?.name}</span>
                                                            <span
                                                                class="text-xs text-muted-foreground truncate">{member.specialty || "Profissional"}</span>
                                                        </div>
                                                        <Button variant="outline" class="rounded-full text-xs px-3 h-8">Ver
                                                            Perfil</Button>
                                                    </Card>
                                                );
                                            }}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            <Show when={activeTab() === "gallery"}>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                                    <Show when={business()?.galleryImages?.length > 0} fallback={
                                        <div class="col-span-full p-10 text-center text-muted-foreground">A galeria de
                                            fotos desta empresa ainda está vazia.</div>
                                    }>
                                        <For each={business()?.galleryImages}>
                                            {(img: any) => (
                                                <div
                                                    class="aspect-square rounded-xl bg-secondary overflow-hidden group cursor-pointer border border-border">
                                                    <img
                                                        src={img.url}
                                                        alt="Galeria do Estabelecimento"
                                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
}