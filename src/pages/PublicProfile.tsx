import { createSignal, For, Show, createResource } from "solid-js";
import { useParams } from "@solidjs/router";
import { Card } from "../components/Widgets/Card";
import { Button } from "../components/Widgets/Button";
import { Tabs } from "../components/Widgets/Tabs";
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon, RibbonIcon } from "../components/Icons/Icons";
import { professionalService } from "../services/professional.service";
import { BookingModal } from "../components/Widgets/BookingModal";
import { ReviewListWidget } from "../components/Widgets/ReviewListWidget";

const TYPE_COLORS: Record<string, string> = {
    diploma:        "bg-blue-100 text-blue-700",
    specialization: "bg-purple-100 text-purple-700",
    course:         "bg-green-100 text-green-700",
    certification:  "bg-amber-100 text-amber-700",
};

const TYPE_LABELS: Record<string, string> = {
    diploma:        "Diploma",
    specialization: "Especialização",
    course:         "Curso",
    certification:  "Certificação",
};

export default function PublicProfile() {
    const params = useParams();
    const [activeTab, setActiveTab] = createSignal("servicos");
    const [selectedServiceForBooking, setSelectedServiceForBooking] = createSignal<any>(null);

    const [profile] = createResource(
        () => params.id,
        professionalService.getPublicProfile
    );

    const [services] = createResource(
        () => params.id,
        professionalService.getServices
    );

    const [portfolio] = createResource(
        () => params.id,
        professionalService.getPortfolio
    );

    const [qualifications] = createResource(
        () => params.id,
        professionalService.getQualifications
    );

    return (
        <Show when={!profile.loading} fallback={
            <div class="mx-auto max-w-5xl p-8 text-center animate-pulse text-muted-foreground">
                Carregando perfil do profissional...
            </div>
        }>
            <div class="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-8 pb-20 md:py-8 animate-in fade-in duration-500">

                {/* --- HEADER CARD --- */}
                <Card class="overflow-hidden border-none shadow-sm bg-card relative">
                    {/* BANNER REAL DO PROFISSIONAL */}
                    <div class="h-48 w-full bg-muted relative">
                        <Show
                            when={profile()?.bannerUrl}
                            fallback={<div class="h-full w-full bg-gradient-to-r from-primary/60 to-primary" />}
                        >
                            <img
                                src={profile()?.bannerUrl}
                                class="w-full h-full object-cover"
                                alt="Banner de perfil"
                            />
                        </Show>
                    </div>

                    <div class="px-6 pb-6 pt-0 relative sm:px-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16 sm:-mt-12">
                        <img
                            src={profile()?.photoUrl || `https://ui-avatars.com/api/?name=${profile()?.user?.name}&background=random`}
                            alt="Foto de Perfil"
                            class="size-32 sm:size-40 rounded-2xl object-cover border-4 border-background shadow-md bg-background"
                        />

                        <div class="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left pt-2 pb-2">
                            <h1 class="text-3xl font-bold text-foreground flex items-center gap-2">
                                {profile()?.user?.name}
                                <Show when={profile()?.visibilityStatus}>
                                    <span class="text-blue-500" title="Perfil Verificado"> <CheckCircleIcon/> </span>
                                </Show>
                            </h1>
                            <p class="text-lg text-muted-foreground font-medium">
                                {profile()?.specialty || "Especialista"}
                            </p>

                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                                <div class="flex items-center gap-1 font-semibold text-foreground">
                                    <span class="text-yellow-500"> <StarIcon/> </span>
                                    {profile()?.averageRating != null ? Number(profile()?.averageRating).toFixed(1) : "5.0"}
                                    <span class="text-muted-foreground font-normal ml-1">({profile()?.reviewCount ?? 0} Avaliações)</span>
                                </div>
                                <div class="flex items-center gap-1 text-muted-foreground">
                                    <MapPinIcon/> {profile()?.city || "Brasil"}
                                </div>
                            </div>
                        </div>

                        <div class="w-full sm:w-auto">
                            <Button variant="primary" class="w-full sm:w-auto py-3 px-8 text-base shadow-lg flex items-center gap-2 justify-center">
                                <CalendarIcon class="size-5"/> Agendar Agora
                            </Button>
                        </div>
                    </div>
                </Card>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- COLUNA LATERAL: SOBRE --- */}
                    <div class="flex flex-col gap-6 lg:col-span-1">
                        <Card class="p-6">
                            <h3 class="font-bold text-lg text-foreground mb-3">Sobre</h3>
                            <p class="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                {profile()?.biography || "Nenhuma biografia disponível."}
                            </p>
                        </Card>

                        <Show when={(qualifications() ?? []).length > 0}>
                            <Card class="p-6 flex flex-col gap-4">
                                <h3 class="font-bold text-lg text-foreground flex items-center gap-2">
                                    <RibbonIcon size={18} class="text-primary" />
                                    Qualificações
                                </h3>

                                <div class="flex flex-col gap-3">
                                    <For each={qualifications()}>
                                        {(q) => (
                                            <a
                                                href={q.certificateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/50 hover:border-primary/40 transition-colors group"
                                            >
                                                {/* Thumbnail ou ícone */}
                                                <div class="shrink-0 size-12 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                                                    <Show
                                                        when={q.certificateUrl && !q.certificateUrl.endsWith(".pdf")}
                                                        fallback={
                                                            <span class="text-xs font-bold text-muted-foreground">PDF</span>
                                                        }
                                                    >
                                                        <img src={q.certificateUrl} class="w-full h-full object-cover" alt={q.title} />
                                                    </Show>
                                                </div>

                                                <div class="flex-1 flex flex-col gap-0.5 min-w-0">
                                                    <span class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {q.title}
                                                    </span>
                                                    <Show when={q.institution}>
                                                        <span class="text-xs text-muted-foreground truncate">{q.institution}</span>
                                                    </Show>
                                                    <div class="flex items-center gap-2 mt-1">
                                                        <span class={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[q.type] ?? "bg-secondary text-foreground"}`}>
                                                            {TYPE_LABELS[q.type] ?? q.type}
                                                        </span>
                                                        <Show when={q.year}>
                                                            <span class="text-xs text-muted-foreground">{q.year}</span>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </a>
                                        )}
                                    </For>
                                </div>
                            </Card>
                        </Show>
                    </div>

                    {/* --- COLUNA PRINCIPAL: TABS --- */}
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

                        <div class="py-2">
                            {/* TAB: SERVIÇOS */}
                            <Show when={activeTab() === "servicos"}>
                                <div class="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Show when={services()?.length > 0} fallback={<div class="p-8 text-center text-muted-foreground">Nenhum serviço disponível no momento.</div>}>
                                        <For each={services()}>
                                            {(svc) => (
                                                <div class="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                                                    <div class="flex flex-col">
                                                        <div class="flex items-center gap-2">
                                                            <span class="font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {svc.service?.name || svc.name}
                                                            </span>
                                                        </div>
                                                        <span class="text-sm text-muted-foreground">{svc.service?.durationMinutes || svc.durationMinutes || svc.duration} min</span>
                                                    </div>
                                                    <div class="flex items-center gap-4">
                                                        <span class="font-semibold text-foreground">
                                                            R$ {svc.service?.price || svc.price}
                                                        </span>
                                                        <Button variant="outline" class="rounded-full text-xs px-4" onClick={() => setSelectedServiceForBooking(svc)}>Reservar</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: PORTFÓLIO */}
                            <Show when={activeTab() === "portfolio"}>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Show when={portfolio()?.length > 0} fallback={<div class="col-span-full p-8 text-center text-muted-foreground">Nenhuma foto no portfólio ainda.</div>}>
                                        <For each={portfolio()}>
                                            {(item) => (
                                                <div class="aspect-square rounded-xl bg-secondary overflow-hidden group cursor-pointer border border-border">
                                                    <img
                                                        src={item.url || item}
                                                        alt="Trabalho de portfólio"
                                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                        </For>
                                    </Show>
                                </div>
                            </Show>

                            {/* TAB: AVALIAÇÕES */}
                            <Show when={activeTab() === "avaliacoes"}>
                                <ReviewListWidget professionalId={params.id} />
                            </Show>
                        </div>
                    </div>
                </div>
            </div>
            <Show when={selectedServiceForBooking()}>
                <BookingModal 
                    isOpen={!!selectedServiceForBooking()}
                    onClose={() => setSelectedServiceForBooking(null)}
                    professionalId={params.id as string}
                    businessId={selectedServiceForBooking().businessProfessional?.business?.id || ""}
                    serviceId={selectedServiceForBooking().service?.id}
                    serviceName={selectedServiceForBooking().service?.name || selectedServiceForBooking().name}
                    durationMinutes={selectedServiceForBooking().service?.durationMinutes || selectedServiceForBooking().durationMinutes || selectedServiceForBooking().duration || 60}
                    price={selectedServiceForBooking().service?.price || selectedServiceForBooking().price}
                />
            </Show>
        </Show>
    );
}