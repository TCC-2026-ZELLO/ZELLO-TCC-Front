import { createSignal, createResource, Show, For } from "solid-js";
import { Card } from "../components/Widgets/Card";
import { Button } from "../components/Widgets/Button";
import { CalendarIcon, ClockIcon, MapPinIcon, CheckCircleIcon, XIcon, BriefcaseIcon } from "../components/Icons/Icons";
import { appointmentsService } from "../services/appointments.service";
import { getClientId } from "../store/appState";

const MyReputation = () => {
    const [rep] = createResource(getClientId, async (id) => {
        if (!id) return null;
        try {
            return await appointmentsService.getClientReputation(id);
        } catch { return null; }
    });

    return (
        <Show when={rep()}>
            {(r) => (
                <div class="flex flex-wrap gap-2 mb-4">
                    <Show when={r().noShowCount > 0}>
                        <div class={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${r().noShowCount >= 3 ? "bg-error/10 text-error border-error/20 font-bold" : "bg-warning/10 text-warning-foreground border-warning/20"}`}>
                            No-Show: Você possui {r().noShowCount} falta(s).{r().noShowCount >= 3 ? " Múltiplas faltas podem bloquear seus agendamentos!" : ""}
                        </div>
                    </Show>
                    <Show when={r().successStreak > 0}>
                        <div class="flex items-center gap-2 bg-success/10 text-success border border-success/20 px-4 py-2 rounded-lg text-sm font-semibold">
                            Streak: {r().successStreak} agendamentos concluídos seguidos
                        </div>
                    </Show>
                </div>
            )}
        </Show>
    );
};

export default function Agendamentos() {
    const [filter, setFilter] = createSignal<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");
    const [appointments, { refetch }] = createResource(appointmentsService.getMyAppointments);
    const [canceling, setCanceling] = createSignal<string | null>(null);
    const [confirmCancelId, setConfirmCancelId] = createSignal<string | null>(null);
    const [cancelErrorMessage, setCancelErrorMessage] = createSignal<string | null>(null);

    const executeCancel = async (id: string) => {
        setCanceling(id);
        try {
            await appointmentsService.cancel(id);
            setConfirmCancelId(null);
            refetch();
        } catch (err: any) {
            setConfirmCancelId(null);
            setCancelErrorMessage(err.message || "Erro ao cancelar agendamento.");
        } finally {
            setCanceling(null);
        }
    };

    const filteredAppointments = () => {
        if (!appointments()) return [];
        if (filter() === "ALL") return appointments();
        return appointments().filter((app: any) => app.status === filter());
    };

    const getStatusLabel = (app: any) => {
        const status = typeof app === "string" ? app : app.status;
        const role = typeof app === "object" ? app.cancelledByRole : null;

        switch (status) {
            case "PENDING": return { text: "Aguardando Confirmação", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
            case "CONFIRMED": return { text: "Confirmado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
            case "COMPLETED": return { text: "Confirmado: Presente", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
            case "CANCELLED": return { text: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" };
            case "NO_SHOW": 
                if (role === "manager" || role === "manager_noshow") {
                    return { text: "No-Show: Falta", color: "bg-red-900/10 text-red-600 border-red-600/20 font-bold" };
                }
                return { text: "No-Show", color: "bg-red-900/10 text-red-600 border-red-600/20 font-bold" };
            default: return { text: status, color: "bg-secondary text-muted-foreground" };
        }
    };

    return (
        <div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 pb-20 md:py-12 animate-in fade-in duration-300">
            <header class="flex flex-col gap-2">
                <h1 class="text-3xl font-bold text-foreground">Meus Agendamentos</h1>
                <p class="text-muted-foreground">Acompanhe e gerencie as suas reservas de serviços.</p>
            </header>
            
            <MyReputation />

            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button variant={filter() === "ALL" ? "primary" : "outline"} onClick={() => setFilter("ALL")} class="rounded-full">Todos</Button>
                <Button variant={filter() === "PENDING" ? "primary" : "outline"} onClick={() => setFilter("PENDING")} class="rounded-full">Pendentes</Button>
                <Button variant={filter() === "CONFIRMED" ? "primary" : "outline"} onClick={() => setFilter("CONFIRMED")} class="rounded-full">Confirmados</Button>
                <Button variant={filter() === "CANCELLED" ? "primary" : "outline"} onClick={() => setFilter("CANCELLED")} class="rounded-full">Cancelados</Button>
            </div>

            <Show when={!appointments.loading} fallback={
                <div class="p-20 text-center text-muted-foreground animate-pulse">Buscando seus agendamentos...</div>
            }>
                <div class="flex flex-col gap-4">
                    <Show when={filteredAppointments()?.length > 0} fallback={
                        <div class="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                            <p class="text-muted-foreground">Você não possui agendamentos nesta categoria.</p>
                        </div>
                    }>
                        <For each={filteredAppointments()}>
                            {(app) => {
                                const statusInfo = getStatusLabel(app);
                                return (
                                    <Card class="p-6 flex flex-col md:flex-row justify-between gap-6 border-border group hover:border-primary/40 transition-colors">
                                        <div class="flex flex-col gap-4">
                                            <div class="flex items-center gap-3">
                                                <div class={`px-3 py-1 rounded-full border text-xs font-bold ${statusInfo.color}`}>
                                                    {statusInfo.text}
                                                </div>
                                                <span class="text-sm text-muted-foreground">ID: #{app.id.substring(0, 8)}</span>
                                            </div>
                                            
                                            <div>
                                                <h3 class="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {app.service?.name || "Serviço Indisponível"}
                                                </h3>
                                                <p class="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                                    <BriefcaseIcon size={14}/> {app.professional?.user?.name || "Profissional"} - {app.business?.tradeName || "Estabelecimento"}
                                                </p>
                                            </div>

                                            <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground">
                                                <div class="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                                                    <CalendarIcon size={16} class="text-muted-foreground"/> 
                                                    {app.date.split("-").reverse().join("/")}
                                                </div>
                                                <div class="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                                                    <ClockIcon size={16} class="text-muted-foreground"/> 
                                                    {app.startTime} - {app.endTime}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex flex-row md:flex-col items-center justify-end md:justify-center gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 min-w-32">
                                            <Show when={app.status === "PENDING" || app.status === "CONFIRMED"}>
                                                <Button 
                                                    variant="outline" 
                                                    class="w-full text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200" 
                                                    onClick={() => setConfirmCancelId(app.id)}
                                                >
                                                    <XIcon size={16} class="mr-2"/>
                                                    Cancelar
                                                </Button>
                                            </Show>
                                            <Show when={app.status === "CONFIRMED"}>
                                                <div class="text-center w-full bg-emerald-50 text-emerald-600 py-2 rounded-lg border border-emerald-100 font-medium text-sm flex items-center justify-center gap-2">
                                                    <CheckCircleIcon size={16} /> Horário Reservado
                                                </div>
                                            </Show>
                                            <Show when={app.status === "COMPLETED"}>
                                                <div class="text-center w-full bg-blue-50 text-blue-600 py-2 rounded-lg border border-blue-100 font-medium text-sm flex items-center justify-center gap-2">
                                                    <CheckCircleIcon size={16} /> Serviço Concluído
                                                </div>
                                            </Show>
                                        </div>
                                    </Card>
                                );
                            }}
                        </For>
                    </Show>
                </div>
            </Show>

            <Show when={confirmCancelId()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                        <div class="p-6 flex flex-col items-center text-center gap-4">
                            <div class="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <XIcon size={32} />
                            </div>
                            <h2 class="text-xl font-bold text-foreground">Cancelar Agendamento</h2>
                            <p class="text-muted-foreground text-sm">Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div class="flex border-t border-border bg-muted/30">
                            <button 
                                class="flex-1 py-4 font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border-r border-border"
                                onClick={() => setConfirmCancelId(null)}
                                disabled={!!canceling()}
                            >
                                Voltar
                            </button>
                            <button 
                                class="flex-1 py-4 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                onClick={() => executeCancel(confirmCancelId()!)}
                                disabled={!!canceling()}
                            >
                                {canceling() ? "Aguarde..." : "Confirmar Cancelamento"}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>

            <Show when={cancelErrorMessage()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                        <div class="p-6 flex flex-col items-center text-center gap-4">
                            <div class="size-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-2">
                                <XIcon size={32} />
                            </div>
                            <h2 class="text-xl font-bold text-foreground">Aviso de Cancelamento</h2>
                            <p class="text-muted-foreground text-sm">{cancelErrorMessage()}</p>
                        </div>
                        <div class="flex border-t border-border bg-muted/30">
                            <button 
                                class="flex-1 py-4 font-bold text-primary hover:bg-primary/10 transition-colors"
                                onClick={() => setCancelErrorMessage(null)}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
}
