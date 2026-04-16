import { createSignal, createMemo, Show, For } from "solid-js";
import { Badge } from "~/components/Widgets/Badge";
import { Tabs } from "~/components/Widgets/Tabs";
import { Avatar } from "~/components/Widgets/Avatar";
import { Button } from "~/components/Widgets/Button";
import { ScheduleGrid, Professional, Appointment } from "~/components/Widgets/ScheduleGrid";
import { Modal } from "~/components/Widgets/Modal";
import { Card } from "~/components/Widgets/Card";
import { Input } from "~/components/Widgets/Input";
import { IconButton } from "~/components/Widgets/IconButton";

const PROFESSIONALS: Professional[] = [
    { id: "1", name: "Isabella F.", initials: "IF" },
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
                    <p class="text-sm text-muted-foreground mt-1">Quarta-feira, 25 de Março de 2026</p>
                </div>
                <Badge variant="warning">
                    <span class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full bg-warning"></span>
                        3 aguardando aprovação
                    </span>
                </Badge>
            </header>

            <Tabs
                activeValue={ActiveTab()}
                onChange={(v) => setActiveTab(v)}
                items={[
                    { label: "Grade da Equipe", value: "grade" },
                    { label: "Pendentes", value: "pendentes", badge: 3 },
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
                    <For each={[
                        { id: 1, client: "Sofia M.", service: "Microagulhamento", prof: "Isabella F.", date: "Seg, 28 Mar", time: "15:00", price: "R$ 450" },
                        { id: 2, client: "Tânia B.", service: "Coloração Completa", prof: "Mariana C.", date: "Ter, 29 Mar", time: "10:00", price: "R$ 200" },
                        { id: 3, client: "Ursula F.", service: "Nail Art Premium", prof: "Juliana S.", date: "Qua, 30 Mar", time: "14:00", price: "R$ 120" }
                    ]}>
                        {(item) => (
                            <div class="flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-xl border border-border bg-card shadow-sm gap-4">
                                <div>
                                    <h4 class="font-bold text-foreground">{item.client}</h4>
                                    <p class="text-sm text-muted-foreground">{item.service} · {item.prof}</p>
                                    <div class="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                        <span class="flex items-center gap-1">📅 {item.date}</span>
                                        <span class="flex items-center gap-1">⏰ {item.time}</span>
                                        <span class="font-bold text-foreground">{item.price}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Button variant="secondary">✓ Aprovar</Button>
                                    <Button variant="outline" class="text-error border-error/20 hover:bg-error/10">✕ Recusar</Button>
                                </div>
                            </div>
                        )}
                    </For>
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
                        <Button class="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6">
                            + Adicionar Bloqueio
                        </Button>
                    </div>

                    <div class="flex flex-col gap-3 mt-2">
                        <For each={[
                            { tipo: "Folga", titulo: "Feriado Municipal", subtitulo: "Dia 27 do mês", corFundo: "bg-error/10 text-error border-error/20" },
                            { tipo: "Pausa", titulo: "Manutenção do espaço", subtitulo: "Dia 2 do mês", corFundo: "bg-warning/10 text-warning border-warning/20" }
                        ]}>
                            {(item) => (
                                <div class="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <div class="flex items-center gap-6">
                                        <div class={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${item.corFundo}`}>
                                            {item.tipo}
                                        </div>
                                        <div>
                                            <p class="font-bold text-foreground">{item.titulo}</p>
                                            <p class="text-sm text-muted-foreground">{item.subtitulo}</p>
                                        </div>
                                    </div>
                                    <IconButton class="text-error hover:bg-error/10">
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
                                <Avatar size="lg" fallbackInitials={appt().clientName.substring(0, 2).toUpperCase()} />
                                <div>
                                    <h4 class="text-lg font-bold text-foreground">{appt().clientName}</h4>
                                    <Badge variant={appt().status === "confirmed" ? "success" : appt().status === "pending" ? "warning" : "default"}>
                                        {appt().status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div class="bg-muted rounded-md p-4 flex flex-col gap-2 border border-border text-foreground">
                                <p class="text-sm"><strong>Serviço:</strong> {appt().service}</p>
                                <p class="text-sm"><strong>Horário:</strong> {appt().startTime} ({appt().durationMins} min)</p>
                                <p class="text-sm"><strong>Profissional:</strong> {PROFESSIONALS.find(p => p.id === appt().professionalId)?.name}</p>
                            </div>

                            <div class="flex gap-2 mt-2">
                                <Button variant="primary" class="flex-1 text-center justify-center">Editar</Button>
                                <Button variant="outline" class="flex-1 text-center justify-center" onClick={() => setIsModalOpen(false)}>Fechar</Button>
                            </div>
                        </div>
                    )}
                </Show>
            </Modal>
        </div>
    );
}