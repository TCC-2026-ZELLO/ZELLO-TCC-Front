import { createSignal, createMemo, Show, For, createResource } from "solid-js";
import { Badge } from "~/components/Widgets/Badge";
import { Tabs } from "~/components/Widgets/Tabs";
import { Avatar } from "~/components/Widgets/Avatar";
import { Button } from "~/components/Widgets/Button";
import { ScheduleGrid, Professional, Appointment } from "~/components/Layout/ScheduleGrid";
import { Modal } from "~/components/Widgets/Modal";
import { Card } from "~/components/Widgets/Card";
import { Input } from "~/components/Widgets/Input";
import { IconButton } from "~/components/Widgets/IconButton";
import { availabilityService } from "~/services/availability.service";
import { appointmentsService } from "~/services/appointments.service";
import { ApiError } from "~/services/api";
import { getActiveBizId } from "~/store/appState";

const PROFESSIONALS: Professional[] = [
    { id: "11111111-1111-1111-1111-111111111111", name: "Rafael (Você)", initials: "RF" },
    { id: "2", name: "Mariana C.", initials: "MC" },
    { id: "3", name: "Juliana S.", initials: "JS" },
    { id: "4", name: "Camila O.", initials: "CO" },
];

const SCHEDULES: Appointment[] = [
    { id: "a1", professionalId: "1", clientName: "Ana P.", service: "Limpeza de Pele", startTime: "09:00", durationMins: 60, status: "completed", colorClass: "bg-secondary text-secondary-foreground" },
    { id: "a2", professionalId: "1", clientName: "Beatriz", service: "Peeling Químico", startTime: "10:00", durationMins: 60, status: "completed", colorClass: "bg-secondary text-secondary-foreground" },
    { id: "a3", professionalId: "1", clientName: "Carla", service: "Microagulhamento", startTime: "12:00", durationMins: 60, status: "confirmed", colorClass: "bg-chart-3" },
    { id: "a4", professionalId: "1", clientName: "Diana", service: "Hidrafacial", startTime: "14:00", durationMins: 60, status: "confirmed", colorClass: "bg-chart-3" },
    { id: "a5", professionalId: "1", clientName: "Elena", service: "Peeling", startTime: "16:00", durationMins: 60, status: "confirmed", colorClass: "bg-chart-3" },

    { id: "b1", professionalId: "2", clientName: "Fernanda", service: "Coloração 2c", startTime: "10:00", durationMins: 60, status: "completed", colorClass: "bg-secondary text-secondary-foreground" },
    { id: "b2", professionalId: "2", clientName: "Gabi", service: "Corte", startTime: "13:00", durationMins: 60, status: "confirmed", colorClass: "bg-profissional" },
    { id: "b3", professionalId: "2", clientName: "Helena", service: "Hidratação", startTime: "15:00", durationMins: 60, status: "confirmed", colorClass: "bg-profissional" },

    { id: "c1", professionalId: "3", clientName: "Isabela", service: "Manicure", startTime: "09:00", durationMins: 60, status: "completed", colorClass: "bg-secondary text-secondary-foreground" },
    { id: "c2", professionalId: "3", clientName: "Júlia", service: "Pedicure", startTime: "10:00", durationMins: 60, status: "completed", colorClass: "bg-secondary text-secondary-foreground" },
    { id: "c3", professionalId: "3", clientName: "Larissa", service: "Manicure", startTime: "13:00", durationMins: 60, status: "confirmed", colorClass: "bg-gestor" },
    { id: "c4", professionalId: "3", clientName: "Natália", service: "Microblading", startTime: "15:00", durationMins: 60, status: "confirmed", colorClass: "bg-gestor" },

    { id: "d1", professionalId: "4", clientName: "Olga", service: "Massagem 90min", startTime: "09:00", durationMins: 90, status: "completed", colorClass: "bg-secondary text-secondary-foreground" },
    { id: "d2", professionalId: "4", clientName: "Paula", service: "Massagem 60min", startTime: "12:00", durationMins: 60, status: "confirmed", colorClass: "bg-error" },
    { id: "d3", professionalId: "4", clientName: "Raquel", service: "Massagem Corporal", startTime: "15:00", durationMins: 60, status: "pending", colorClass: "bg-error" },
];

export default function TeamSchedules() {
    const [ActiveTab, setActiveTab] = createSignal("grade");
    const [ProfessionalIdFilter, setProfessionalIdFilter] = createSignal<string | null>(null);

    const [isCreateBlockOpen, setIsCreateBlockOpen] = createSignal(false);
    const [blockDate, setBlockDate] = createSignal("");
    const [blockStart, setBlockStart] = createSignal("");
    const [blockEnd, setBlockEnd] = createSignal("");
    const [blockReason, setBlockReason] = createSignal("");
    const [blockProfId, setBlockProfId] = createSignal("");
    const [createError, setCreateError] = createSignal("");
    const [pendingConflictData, setPendingConflictData] = createSignal<any>(null);

    const [exceptions, { refetch: refetchExceptions }] = createResource(async () => {
        try {
           return await availabilityService.getExceptions();
        } catch(e) { return []; }
    });

    const [appointments, { refetch: refetchAppointments }] = createResource(
        () => getActiveBizId(),
        async (businessId) => {
            try {
                if (!businessId) return [];
                return await appointmentsService.getByBusiness(businessId);
            } catch(e) {
                return [];
            }
        }
    );

    const pendingAppointments = createMemo(() => {
        if (!appointments()) return [];
        return appointments().filter((a: any) => a.status === "PENDING");
    });

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await appointmentsService.updateStatus(id, status);
            refetchAppointments();
        } catch (err: any) {
            alert(err.message || "Erro ao atualizar status.");
        }
    };

    const handleSaveBlock = async (forceOverwrite = false) => {
        setCreateError("");
        if (!blockDate() || !blockStart() || !blockEnd() || !blockReason()) {
            setCreateError("Preencha todos os campos obrigatórios.");
            return;
        }
        try {
            const finalStart = blockStart().length === 5 ? `${blockStart()}:00` : blockStart();
            const finalEnd = blockEnd().length === 5 ? `${blockEnd()}:00` : blockEnd();
            
            const res = await availabilityService.createException({
                date: blockDate(),
                startTime: finalStart,
                endTime: finalEnd,
                reason: blockReason(),
                professionalId: blockProfId() || undefined,
                forceOverwritePending: forceOverwrite
            });
            
            refetchExceptions();
            setIsCreateBlockOpen(false);
            setPendingConflictData(null);
            
            setBlockDate(""); setBlockStart(""); setBlockEnd(""); setBlockReason(""); setBlockProfId("");
        } catch(e: any) {
            if (e instanceof ApiError) {
                if (e.status === 412) {
                    setPendingConflictData(e.data);
                } else if (e.status === 409) {
                    setCreateError("Conflito: Já existem horários confirmados neste intervalo.");
                } else {
                    setCreateError(e.message || "Erro ao criar bloqueio.");
                }
            } else {
                setCreateError("Erro ao criar bloqueio.");
            }
        }
    };

    const handleDeleteException = async (id: string) => {
        if (!confirm("Deseja realmente apagar este bloqueio?")) return;
        try {
            await availabilityService.deleteException(id);
            refetchExceptions();
        } catch(e) {
            alert("Erro ao apagar bloqueio.");
        }
    };

    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null);

    const filteredProfessionals = createMemo(() => {
        if (!ProfessionalIdFilter()) return PROFESSIONALS;
        return PROFESSIONALS.filter(p => p.id === ProfessionalIdFilter());
    });

    const [diasSelecionados, setDiasSelecionados] = createSignal(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]);
    const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    const toggleDia = (dia: string) => {
        if (diasSelecionados().includes(dia)) {
            setDiasSelecionados(diasSelecionados().filter(d => d !== dia));
        } else {
            setDiasSelecionados([...diasSelecionados(), dia]);
        }
    };

    const handleModalOpen = (appt: Appointment) => {
        setSelectedAppointment(appt);
        setIsModalOpen(true);
    };

    return (
        <div class="flex flex-col gap-6 w-full max-w-6xl mx-auto p-10 text-foreground bg-background">
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold">Agenda da Equipe</h1>
                    <p class="text-sm text-muted-foreground mt-1">Gestão de horários e agendamentos</p>
                </div>
                <Show when={pendingAppointments().length > 0}>
                    <Badge variant="warning">
                        <span class="flex items-center gap-2">
                            <span class="h-2 w-2 rounded-full bg-warning animate-pulse"></span>
                            {pendingAppointments().length} aguardando aprovação
                        </span>
                    </Badge>
                </Show>
            </header>

            <Tabs
                activeValue={ActiveTab()}
                onChange={(v) => setActiveTab(v)}
                items={[
                    { label: "Grade da Equipe", value: "grade" },
                    { label: "Pendentes", value: "pendentes", badge: pendingAppointments().length || undefined },
                    { label: "Horário de Expediente", value: "horario" },
                    { label: "Bloqueios", value: "bloqueios" }
                ]}
            />

            <Show when={ActiveTab() === "grade"}>
                <div class="flex flex-col gap-4">
                    <div class="flex gap-2 overflow-x-auto pb-2">
                        <button
                            class={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${!ProfessionalIdFilter() ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'}`}
                            onClick={() => setProfessionalIdFilter(null)}
                        >
                            Todos
                        </button>
                        <For each={PROFESSIONALS}>
                            {(prof) => (
                                <button
                                    class={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${ProfessionalIdFilter() === prof.id ? 'border-primary bg-card text-foreground' : 'border-transparent bg-card text-muted-foreground hover:bg-secondary'}`}
                                    onClick={() => setProfessionalIdFilter(prof.id)}
                                >
                                    <Avatar size="sm" fallbackInitials={prof.initials} />
                                    {prof.name}
                                </button>
                            )}
                        </For>
                    </div>
                    <ScheduleGrid
                        professionals={filteredProfessionals()}
                        appointments={SCHEDULES}
                        startHour={8}
                        endHour={17}
                        onAppointmentClick={handleModalOpen}
                    />
                </div>
            </Show>

            <Show when={ActiveTab() === "pendentes"}>
                <div class="flex flex-col gap-4">
                    <Show when={!appointments.loading} fallback={<div class="p-8 text-center text-muted-foreground">Carregando pendentes...</div>}>
                        <Show when={pendingAppointments().length > 0} fallback={
                            <div class="p-10 border border-dashed border-border rounded-xl text-center text-muted-foreground bg-card">
                                Não há agendamentos pendentes no momento.
                            </div>
                        }>
                            <For each={pendingAppointments()}>
                                {(item: any) => (
                                    <div class="flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-xl border border-border bg-card shadow-sm gap-4">
                                        <div>
                                            <h4 class="font-bold text-foreground">{item.client?.name || "Cliente"}</h4>
                                            <p class="text-sm text-muted-foreground">{item.service?.name} · {item.professional?.user?.name}</p>
                                            <div class="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                <span class="flex items-center gap-1">📅 {item.date}</span>
                                                <span class="flex items-center gap-1">⏰ {item.startTime}</span>
                                                <span class="font-bold text-foreground">R$ {item.service?.price}</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Button variant="secondary" onClick={() => handleUpdateStatus(item.id, "CONFIRMED")}>✓ Aprovar</Button>
                                            <Button variant="outline" class="text-error border-error/20 hover:bg-error/10" onClick={() => handleUpdateStatus(item.id, "CANCELLED")}>✕ Recusar</Button>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </Show>
                </div>
            </Show>

            <Show when={ActiveTab() === "horario"}>
                <div class="flex flex-col gap-4">
                    <Card>
                        <div class="mb-6 flex items-center gap-2 border-b border-border pb-4 font-medium text-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span>Horário de Funcionamento</span>
                        </div>

                        <div class="flex flex-col gap-8">
                            <div>
                                <span class="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Dias de Funcionamento</span>
                                <div class="flex flex-wrap gap-2">
                                    <For each={diasDaSemana}>
                                        {(dia) => (
                                            <button
                                                onClick={() => toggleDia(dia)}
                                                class={`rounded-full px-5 py-2 text-sm font-medium transition-colors border ${
                                                    diasSelecionados().includes(dia)
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                                                }`}
                                            >
                                                {dia}
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Input labelText="ABERTURA" placeholder="09:00" />
                                <Input labelText="FECHAMENTO" placeholder="19:00" />
                                <Input labelText="INÍCIO DO ALMOÇO" placeholder="12:00" />
                                <Input labelText="FIM DO ALMOÇO" placeholder="13:00" />
                            </div>

                            <div class="pt-2">
                                <Button class="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 inline-block">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                        <polyline points="7 3 7 8 15 8"></polyline>
                                    </svg>
                                    Salvar Horários
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Show>

            <Show when={ActiveTab() === "bloqueios"}>
                <div class="flex flex-col gap-4">
                    <div>
                        <Button class="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6" onClick={() => setIsCreateBlockOpen(true)}>
                            + Adicionar Bloqueio
                        </Button>
                    </div>

                    <div class="flex flex-col gap-3 mt-2">
                        <Show when={exceptions() && exceptions().length > 0} fallback={<p class="text-muted-foreground text-sm">Nenhum bloqueio registrado.</p>}>
                            <For each={exceptions()}>
                                {(item: any) => (
                                    <div class="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                                        <div class="flex items-center gap-6">
                                            <div class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-error/10 text-error border-error/20">
                                                Bloqueio
                                            </div>
                                            <div>
                                                <p class="font-bold text-foreground">{item.reason}</p>
                                                <p class="text-sm text-muted-foreground">
                                                    {item.date} • {item.startTime} - {item.endTime} 
                                                    {item.professional ? ` • ${item.professional.name || 'Profissional ' + item.professional.id.substring(0,4)}` : ' • Todo o Estabelecimento'}
                                                </p>
                                            </div>
                                        </div>
                                        <IconButton class="text-error hover:bg-error/10" onClick={() => handleDeleteException(item.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </IconButton>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </div>
                </div>
            </Show>

            <Modal
                isOpen={isModalOpen()}
                onClose={() => setIsModalOpen(false)}
                title="Detalhes do Agendamento"
            >
                <Show when={selectedAppointment()}>
                    {(appt) => (
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-3">
                                <Avatar size="lg" fallbackInitials={appt()?.clientName?.substring(0, 2).toUpperCase() || ""} />
                                <div>
                                    <h4 class="text-lg font-bold text-foreground">{appt()?.clientName}</h4>
                                    <Badge variant={appt()?.status === "confirmed" ? "success" : appt()?.status === "pending" ? "warning" : "default"}>
                                        {appt()?.status?.toUpperCase() || ""}
                                    </Badge>
                                </div>
                            </div>

                            <div class="bg-muted rounded-md p-4 flex flex-col gap-2 border border-border text-foreground">
                                <p class="text-sm"><strong>Serviço:</strong> {appt()?.service}</p>
                                <p class="text-sm"><strong>Horário:</strong> {appt()?.startTime} ({appt()?.durationMins} min)</p>
                                <p class="text-sm"><strong>Profissional:</strong> {PROFESSIONALS.find(p => p.id === appt()?.professionalId)?.name}</p>
                            </div>

                            <div class="flex gap-2 mt-2">
                                <Button variant="primary" class="flex-1 text-center justify-center">Editar</Button>
                                <Button variant="outline" class="flex-1 text-center justify-center" onClick={() => setIsModalOpen(false)}>Fechar</Button>
                            </div>
                        </div>
                    )}
                </Show>
            </Modal>
            <Modal
                isOpen={isCreateBlockOpen()}
                onClose={() => { setIsCreateBlockOpen(false); setPendingConflictData(null); setCreateError(""); }}
                title="Novo Bloqueio"
            >
                <div class="flex flex-col gap-4">
                    <Show when={createError()}>
                        <div class="p-3 rounded bg-error/10 text-error text-sm font-medium">{createError()}</div>
                    </Show>
                    
                    <Show when={pendingConflictData()}>
                        <div class="p-4 rounded bg-warning/20 border border-warning/30 flex flex-col gap-2 text-sm">
                            <p class="font-bold text-warning-foreground">Conflito de Agendamentos Pendentes</p>
                            <p>{pendingConflictData().message}</p>
                            <p>Deseja forçar o bloqueio e cancelar esses agendamentos?</p>
                            <div class="flex gap-2 mt-2">
                                <Button variant="primary" class="bg-warning text-warning-foreground hover:bg-warning/80" onClick={() => handleSaveBlock(true)}>Sim, forçar bloqueio</Button>
                                <Button variant="outline" onClick={() => setPendingConflictData(null)}>Não, cancelar</Button>
                            </div>
                        </div>
                    </Show>

                    <Show when={!pendingConflictData()}>
                        <Input labelText="Data" type="date" value={blockDate()} onInput={(e: any) => setBlockDate(e.target.value)} />
                        <div class="flex gap-4">
                            <div class="flex-1">
                                <Input labelText="Início" type="time" value={blockStart()} onInput={(e: any) => setBlockStart(e.target.value)} />
                            </div>
                            <div class="flex-1">
                                <Input labelText="Fim" type="time" value={blockEnd()} onInput={(e: any) => setBlockEnd(e.target.value)} />
                            </div>
                        </div>
                        <Input labelText="Motivo" placeholder="Ex: Feriado, manutenção, almoço..." value={blockReason()} onInput={(e: any) => setBlockReason(e.target.value)} />
                        
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-bold text-muted-foreground uppercase">Afeta</label>
                            <select 
                                class="h-10 rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={blockProfId()} 
                                onChange={(e: any) => setBlockProfId(e.target.value)}
                            >
                                <option value="">Todo o Estabelecimento</option>
                                <For each={PROFESSIONALS}>
                                    {(p) => <option value={p.id}>{p.name}</option>}
                                </For>
                            </select>
                        </div>
                        
                        <div class="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setIsCreateBlockOpen(false)}>Cancelar</Button>
                            <Button variant="primary" onClick={() => handleSaveBlock(false)}>Salvar Bloqueio</Button>
                        </div>
                    </Show>
                </div>
            </Modal>
        </div>
    );
}