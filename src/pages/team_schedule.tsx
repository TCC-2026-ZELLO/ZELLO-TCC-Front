import { createSignal, createMemo, Show, For, createResource, Suspense } from "solid-js";
import { Badge } from "../components/Widgets/Badge";
import { Tabs } from "../components/Widgets/Tabs";
import { Avatar } from "../components/Widgets/Avatar";
import { Button } from "../components/Widgets/Button";
import { ScheduleGrid, Professional, Appointment } from "../components/Layout/ScheduleGrid";
import { Modal } from "../components/Widgets/Modal";
import { Card } from "../components/Widgets/Card";
import { Input } from "../components/Widgets/Input";
import { IconButton } from "../components/Widgets/IconButton";
import { BookingModal } from "../components/Widgets/BookingModal";

import { ApiError } from "../services/api";
import { availabilityService } from "../services/availability.service";
import { appointmentsService, MAX_RESCHEDULES } from "../services/appointments.service";
import { businessProfessionalService } from "../services/business-professional.service";
import { getActiveBizId, t } from "../store/appState";
import { toast } from "../store/toastStore";

const formatDate = (isoDate?: string) => (isoDate ? isoDate.split("-").reverse().join("/") : "");

type NoShowAction = "MARK" | "REVERT" | "PRESENCE";

const ClientReputationBadge = (props: { clientId?: string }) => {
    const [rep] = createResource(() => props.clientId, async (id) => {
        if (!id) return null;
        try {
            return await appointmentsService.getClientReputation(id);
        } catch { return null; }
    });

    return (
        <Show when={rep()}>
            {(r) => (
                <div class="flex flex-wrap gap-2 mt-1.5">
                    <Show when={r().noShowCount > 0}>
                        <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            r().noShowCount >= 3
                                ? "bg-error/10 text-error border-error/20"
                                : "bg-warning/10 text-warning-foreground border-warning/20"
                        }`}>
                            {r().noShowCount >= 3
                                ? t().teamSchedule.reputation.highRisk(r().noShowCount)
                                : t().teamSchedule.reputation.recentNoShows(r().noShowCount)}
                        </span>
                    </Show>
                    <Show when={r().successStreak > 0}>
                        <span class="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
                            {t().teamSchedule.reputation.streak(r().successStreak)}
                        </span>
                    </Show>
                </div>
            )}
        </Show>
    );
};

export default function TeamSchedules() {
    const [activeTab, setActiveTab] = createSignal("grade");
    const [professionalIdFilter, setProfessionalIdFilter] = createSignal<string | null>(null);
    const [selectedDate, setSelectedDate] = createSignal(new Date().toISOString().split('T')[0]);

    const [professionals] = createResource(async () => {
        const res = await businessProfessionalService.getProfessionals();
        const raw = Array.isArray(res) ? res : (res?.data || []);
        return raw.map((item: any) => ({
            id: item.professional?.id || item.id,
            name: item.professional?.user?.name || item.name || t().teamSchedule.defaultProfessional,
            initials: (item.professional?.user?.name || item.name || "P").substring(0, 2).toUpperCase()
        }));
    });

    // Guardamos a resposta crua da API: o modal de detalhes precisa de campos
    // (serviceId, rescheduleCount, proposta pendente, cancelledByRole) que não
    // cabem no tipo Appointment usado pela grade.
    const [rawAppointments, { refetch: refetchAppointments }] = createResource(selectedDate, async (date) => {
        const res = await appointmentsService.getAppointments({ date });
        return Array.isArray(res) ? res : (res?.data || []);
    });

    const appointments = createMemo<Appointment[]>(() =>
        (rawAppointments() || []).map((a: any) => ({
            id: a.id,
            professionalId: a.professional?.id,
            clientId: a.client?.id,
            clientName: a.client?.name || t().teamSchedule.defaultClient,
            service: a.service?.name || t().teamSchedule.defaultService,
            startTime: a.startTime,
            endTime: a.endTime,
            durationMins: a.service?.durationMinutes || 60,
            date: a.date,
            status: (a.status || 'pending').toLowerCase() as "confirmed" | "pending" | "completed" | "no_show",
            cancelledByRole: a.cancelledByRole,
            colorClass: a.status === 'PENDING'
                ? 'bg-warning'
                : a.status === 'NO_SHOW'
                    ? 'bg-error/80'
                    : 'bg-primary',
            type: "appointment"
        } as Appointment))
    );

    const rawById = (id: string) => (rawAppointments() || []).find((a: any) => a.id === id);

    const [exceptions, { refetch: refetchExceptions }] = createResource(selectedDate, async (date) => {
        try { return await availabilityService.getExceptions({ date }); } catch { return []; }
    });

    const filteredProfessionals = createMemo(() => {
        const list = professionals() || [];
        if (!professionalIdFilter()) return list;
        return list.filter((p: Professional) => p.id === professionalIdFilter());
    });

    const confirmedSchedules = createMemo(() =>
        appointments().filter(a => a.status === 'confirmed' || a.status === 'completed' || a.status === 'no_show')
    );
    const pendingSchedules = createMemo(() => appointments().filter(a => a.status === 'pending'));

    const gridEvents = createMemo(() => {
        const apps = confirmedSchedules();
        const blocks = (exceptions() || []).map((ex: any) => {
            const [sh, sm] = (ex.startTime || "00:00").split(':').map(Number);
            const [eh, em] = (ex.endTime || "00:00").split(':').map(Number);
            const dur = (eh * 60 + em) - (sh * 60 + sm);

            return {
                id: ex.id,
                professionalId: ex.professional?.id,
                reason: ex.reason,
                startTime: ex.startTime,
                durationMins: dur > 0 ? dur : 60,
                type: "block"
            } as Appointment;
        });
        return [...apps, ...blocks];
    });

    // --- Modais de confirmação -------------------------------------------
    const [confirmRefuseId, setConfirmRefuseId] = createSignal<string | null>(null);
    const [confirmNoShowModal, setConfirmNoShowModal] = createSignal<{ type: NoShowAction; id: string } | null>(null);
    const [confirmDeleteBlockId, setConfirmDeleteBlockId] = createSignal<string | null>(null);

    const handleUpdateStatus = async (id: string, status: string) => {
        if (status === "CANCELLED") {
            setConfirmRefuseId(id);
            return;
        }
        try {
            await appointmentsService.updateStatus(id, status);
            refetchAppointments();
            toast.success(t().teamSchedule.statusUpdated.approved);
        } catch (err: any) {
            toast.error(err.message || t().teamSchedule.statusUpdated.error);
        }
    };

    const executeRefuseAppointment = async (id: string) => {
        try {
            await appointmentsService.updateStatus(id, "CANCELLED");
            refetchAppointments();
            toast.success(t().teamSchedule.statusUpdated.rejected);
        } catch (err: any) {
            toast.error(err.message || t().teamSchedule.statusUpdated.refuseError);
        } finally {
            setConfirmRefuseId(null);
        }
    };

    // --- No-Show ----------------------------------------------------------
    const executeMarkNoShow = async (id: string) => {
        try {
            await appointmentsService.markNoShow(id);
            refetchAppointments();
            toast.success(t().teamSchedule.noShowModal.markSuccess);
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(e.message || t().teamSchedule.noShowModal.markError);
        } finally {
            setConfirmNoShowModal(null);
        }
    };

    const executeRevertNoShow = async (id: string) => {
        try {
            await appointmentsService.revertNoShow(id);
            refetchAppointments();
            toast.success(t().teamSchedule.noShowModal.revertSuccess);
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(e.message || t().teamSchedule.noShowModal.revertError);
        } finally {
            setConfirmNoShowModal(null);
        }
    };

    const confirmNoShowAction = () => {
        const data = confirmNoShowModal();
        if (!data) return;
        // PRESENCE reaproveita o revert: o atendimento foi liberado sem
        // penalidade e volta ao fluxo normal. Confirmar se o backend conclui
        // o atendimento nesse endpoint.
        return data.type === "MARK"
            ? executeMarkNoShow(data.id)
            : executeRevertNoShow(data.id);
    };

    const noShowCopy = (type: NoShowAction) => {
        const copy = t().teamSchedule.noShowModal;
        if (type === "MARK") return copy.mark;
        if (type === "PRESENCE") return copy.presence;
        return copy.revert;
    };

    // --- Detalhes ---------------------------------------------------------
    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [selectedAppointment, setSelectedAppointment] = createSignal<any>(null);
    const [showCancelJustified, setShowCancelJustified] = createSignal(false);
    const [cancelReason, setCancelReason] = createSignal("");
    const [affectsReputation, setAffectsReputation] = createSignal(false);

    const handleModalOpen = (appt: Appointment) => {
        if (appt.type === "block") return;
        const raw = rawById(appt.id);
        if (!raw) return;
        setSelectedAppointment(raw);
        setShowCancelJustified(false);
        setCancelReason("");
        setAffectsReputation(false);
        setIsModalOpen(true);
    };

    const submitCancelJustified = async (id: string) => {
        if (!cancelReason()) {
            toast.error(t().teamSchedule.justifiedCancel.reasonRequired);
            return;
        }
        try {
            await appointmentsService.cancelJustified(id, cancelReason(), affectsReputation());
            refetchAppointments();
            toast.success(t().teamSchedule.justifiedCancel.success);
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(e.message || t().teamSchedule.justifiedCancel.error);
        }
    };

    // --- Proposta de novo horário (RF22/AC3) ------------------------------
    const [proposalTarget, setProposalTarget] = createSignal<any>(null);

    const remainingReschedules = (appt: any) =>
        Math.max(0, MAX_RESCHEDULES - (appt?.rescheduleCount ?? 0));

    const canPropose = (appt: any) =>
        ["PENDING", "CONFIRMED"].includes(appt?.status) &&
        !appt?.proposedDate &&
        remainingReschedules(appt) > 0;

    const openProposal = (appt: any) => {
        setIsModalOpen(false);
        setProposalTarget(appt);
    };

    // --- Bloqueios --------------------------------------------------------
    const [isCreateBlockOpen, setIsCreateBlockOpen] = createSignal(false);
    const [blockDate, setBlockDate] = createSignal(selectedDate());
    const [blockStart, setBlockStart] = createSignal("");
    const [blockEnd, setBlockEnd] = createSignal("");
    const [blockReason, setBlockReason] = createSignal("");
    const [blockProfId, setBlockProfId] = createSignal("");
    const [createError, setCreateError] = createSignal("");
    const [pendingConflictData, setPendingConflictData] = createSignal<any>(null);

    const handleSaveBlock = async (forceOverwrite = false) => {
        setCreateError("");
        if (!blockDate() || !blockStart() || !blockEnd() || !blockReason()) {
            setCreateError(t().teamSchedule.blocks.requiredFields);
            return;
        }
        try {
            const finalStart = blockStart().length === 5 ? `${blockStart()}:00` : blockStart();
            const finalEnd = blockEnd().length === 5 ? `${blockEnd()}:00` : blockEnd();

            await availabilityService.createException({
                date: blockDate(),
                startTime: finalStart,
                endTime: finalEnd,
                reason: blockReason(),
                professionalId: blockProfId() || undefined,
                forceOverwritePending: forceOverwrite
            });

            refetchExceptions();
            refetchAppointments();
            setIsCreateBlockOpen(false);
            setPendingConflictData(null);
            setBlockStart(""); setBlockEnd(""); setBlockReason(""); setBlockProfId("");
            toast.success(t().teamSchedule.blocks.created);
        } catch(e: any) {
            if (e instanceof ApiError) {
                if (e.status === 412) setPendingConflictData(e.data);
                else if (e.status === 409) setCreateError(t().teamSchedule.blocks.confirmedConflict);
                else setCreateError(e.message || t().teamSchedule.blocks.createError);
            } else setCreateError(t().teamSchedule.blocks.createError);
        }
    };

    const executeDeleteException = async (id: string) => {
        try {
            await availabilityService.deleteException(id);
            refetchExceptions();
            toast.success(t().teamSchedule.blocks.deleted);
        } catch(e) {
            toast.error(t().teamSchedule.blocks.deleteError);
        } finally {
            setConfirmDeleteBlockId(null);
        }
    };

    // --- Expediente -------------------------------------------------------
    const diasDaSemana = () => {
        const d = t().teamSchedule.hours.days;
        return [
            { id: 1, label: d.mon }, { id: 2, label: d.tue }, { id: 3, label: d.wed },
            { id: 4, label: d.thu }, { id: 5, label: d.fri }, { id: 6, label: d.sat }, { id: 0, label: d.sun }
        ];
    };

    const [diasSelecionados, setDiasSelecionados] = createSignal([1, 2, 3, 4, 5, 6]);
    const [abertura, setAbertura] = createSignal("08:00");
    const [fechamento, setFechamento] = createSignal("18:00");
    const [inicioAlmoco, setInicioAlmoco] = createSignal("12:00");
    const [fimAlmoco, setFimAlmoco] = createSignal("13:00");
    const [isSavingHours, setIsSavingHours] = createSignal(false);

    const toggleDia = (diaId: number) => {
        if (diasSelecionados().includes(diaId)) setDiasSelecionados(diasSelecionados().filter(d => d !== diaId));
        else setDiasSelecionados([...diasSelecionados(), diaId]);
    };

    const handleSaveOperatingHours = async () => {
        const businessId = getActiveBizId();
        if (!businessId) {
            toast.error(t().teamSchedule.hours.noBusiness);
            return;
        }

        setIsSavingHours(true);
        try {
            const promises = [0, 1, 2, 3, 4, 5, 6].map(diaId => availabilityService.saveOperatingHour({
                businessId,
                dayOfWeek: diaId,
                startTime: `${abertura()}:00`,
                endTime: `${fechamento()}:00`,
                isOpen: diasSelecionados().includes(diaId)
            }));
            await Promise.all(promises);
            toast.success(t().teamSchedule.hours.saved);
        } catch (err: any) {
            toast.error(err instanceof ApiError ? (err.message || t().teamSchedule.hours.saveError) : t().teamSchedule.hours.saveError);
        } finally {
            setIsSavingHours(false);
        }
    };

    return (
        <div class="flex flex-col gap-6 w-full max-w-6xl mx-auto p-10 text-foreground bg-background">
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold">{t().teamSchedule.title}</h1>
                    <p class="text-sm text-muted-foreground mt-1">{t().teamSchedule.subtitle}</p>
                </div>
                <div class="flex items-center gap-4">
                    <Input type="date" value={selectedDate()} onInput={(e) => setSelectedDate(e.currentTarget.value)} class="w-48"/>
                    <Show when={pendingSchedules().length > 0}>
                        <Badge variant="warning">
                            <span class="flex items-center gap-2">
                                <span class="h-2 w-2 rounded-full bg-warning animate-pulse"></span>
                                {t().teamSchedule.pendingBadge(pendingSchedules().length)}
                            </span>
                        </Badge>
                    </Show>
                </div>
            </header>

            <Tabs
                activeValue={activeTab()}
                onChange={setActiveTab}
                items={[
                    { label: t().teamSchedule.tabs.grid, value: "grade" },
                    { label: t().teamSchedule.tabs.pending, value: "pendentes", badge: pendingSchedules().length || undefined },
                    { label: t().teamSchedule.tabs.hours, value: "horario" },
                    { label: t().teamSchedule.tabs.blocks, value: "bloqueios" }
                ]}
            />

            <Suspense fallback={<div class="p-10 text-center text-muted-foreground">{t().teamSchedule.loading}</div>}>
                <Show when={activeTab() === "grade"}>
                    <div class="flex flex-col gap-4">
                        <div class="flex gap-2 overflow-x-auto pb-2">
                            <button
                                class={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${!professionalIdFilter() ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'}`}
                                onClick={() => setProfessionalIdFilter(null)}
                            >
                                {t().teamSchedule.allProfessionals}
                            </button>
                            <For each={professionals() || []}>
                                {(prof: any) => (
                                    <button
                                        class={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${professionalIdFilter() === prof.id ? 'border-primary bg-card text-foreground' : 'border-transparent bg-card text-muted-foreground hover:bg-secondary'}`}
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
                            appointments={gridEvents()}
                            startHour={parseInt(abertura().split(":")[0]) || 8}
                            endHour={parseInt(fechamento().split(":")[0]) || 18}
                            onAppointmentClick={handleModalOpen}
                        />
                    </div>
                </Show>

                <Show when={activeTab() === "pendentes"}>
                    <div class="flex flex-col gap-4">
                        <Show when={!rawAppointments.loading} fallback={<div class="p-8 text-center text-muted-foreground">{t().teamSchedule.pending.loading}</div>}>
                            <Show when={pendingSchedules().length > 0} fallback={
                                <div class="p-10 border border-dashed border-border rounded-xl text-center text-muted-foreground bg-card">
                                    {t().teamSchedule.pending.empty}
                                </div>
                            }>
                                <For each={pendingSchedules()}>
                                    {(item) => {
                                        const profName = professionals()?.find((p: any) => p.id === item.professionalId)?.name
                                            || t().teamSchedule.defaultProfessional;
                                        const raw = () => rawById(item.id);
                                        return (
                                            <div class="flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-xl border border-border bg-card shadow-sm gap-4">
                                                <div>
                                                    <h4 class="font-bold text-foreground">{item.clientName}</h4>
                                                    <p class="text-sm text-muted-foreground">{item.service} · {profName}</p>
                                                    <ClientReputationBadge clientId={(item as any).clientId} />
                                                    <div class="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                        <span class="flex items-center gap-1">📅 {formatDate(item.date)}</span>
                                                        <span class="flex items-center gap-1">⏰ {item.startTime}</span>
                                                    </div>
                                                    <Show when={raw()?.proposedDate}>
                                                        <p class="text-xs text-warning mt-2">
                                                            {t().teamSchedule.pending.proposalSent(formatDate(raw().proposedDate), raw().proposedStartTime)}
                                                        </p>
                                                    </Show>
                                                </div>
                                                <div class="flex items-center gap-2">
                                                    <Button variant="secondary" onClick={() => handleUpdateStatus(item.id, "CONFIRMED")}>
                                                        {t().teamSchedule.pending.approve}
                                                    </Button>
                                                    <Show when={canPropose(raw())}>
                                                        <Button variant="outline" onClick={() => openProposal(raw())}>
                                                            {t().teamSchedule.pending.propose}
                                                        </Button>
                                                    </Show>
                                                    <Button variant="outline" class="text-error border-error/20 hover:bg-error/10" onClick={() => handleUpdateStatus(item.id, "CANCELLED")}>
                                                        {t().teamSchedule.pending.reject}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    }}
                                </For>
                            </Show>
                        </Show>
                    </div>
                </Show>

                <Show when={activeTab() === "horario"}>
                    <div class="flex flex-col gap-4">
                        <Card>
                            <div class="mb-6 flex items-center gap-2 border-b border-border pb-4 font-medium text-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                <span>{t().teamSchedule.hours.title}</span>
                            </div>

                            <div class="flex flex-col gap-8">
                                <div>
                                    <span class="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {t().teamSchedule.hours.daysLabel}
                                    </span>
                                    <div class="flex flex-wrap gap-2">
                                        <For each={diasDaSemana()}>
                                            {(dia) => (
                                                <button
                                                    onClick={() => toggleDia(dia.id)}
                                                    class={`rounded-full px-5 py-2 text-sm font-medium transition-colors border ${
                                                        diasSelecionados().includes(dia.id)
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "border-border bg-card text-muted-foreground hover:bg-secondary"
                                                    }`}
                                                >
                                                    {dia.label}
                                                </button>
                                            )}
                                        </For>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Input labelText={t().teamSchedule.hours.opening} type="time" value={abertura()} onInput={e => setAbertura(e.currentTarget.value)} />
                                    <Input labelText={t().teamSchedule.hours.closing} type="time" value={fechamento()} onInput={e => setFechamento(e.currentTarget.value)} />
                                    <Input labelText={t().teamSchedule.hours.lunchStart} type="time" value={inicioAlmoco()} onInput={e => setInicioAlmoco(e.currentTarget.value)} />
                                    <Input labelText={t().teamSchedule.hours.lunchEnd} type="time" value={fimAlmoco()} onInput={e => setFimAlmoco(e.currentTarget.value)} />
                                </div>

                                <div class="pt-2">
                                    <Button class="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6" onClick={handleSaveOperatingHours} disabled={isSavingHours()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 inline-block"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                        {isSavingHours() ? t().teamSchedule.hours.saving : t().teamSchedule.hours.save}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Show>

                <Show when={activeTab() === "bloqueios"}>
                    <div class="flex flex-col gap-4">
                        <div>
                            <Button class="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6" onClick={() => setIsCreateBlockOpen(true)}>
                                {t().teamSchedule.blocks.add}
                            </Button>
                        </div>

                        <div class="flex flex-col gap-3 mt-2">
                            <Show when={exceptions() && exceptions().length > 0} fallback={<p class="text-muted-foreground text-sm">{t().teamSchedule.blocks.empty}</p>}>
                                <For each={exceptions()}>
                                    {(item: any) => (
                                        <div class="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                                            <div class="flex items-center gap-6">
                                                <div class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-error/10 text-error border-error/20">
                                                    {t().teamSchedule.blocks.tag}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-foreground">{item.reason}</p>
                                                    <p class="text-sm text-muted-foreground">
                                                        {formatDate(item.date)} • {item.startTime} - {item.endTime}
                                                        {item.professional
                                                            ? ` • ${item.professional.name || t().teamSchedule.defaultProfessional + ' ' + item.professional.id.substring(0, 4)}`
                                                            : ` • ${t().teamSchedule.blocks.wholeBusiness}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <IconButton class="text-error hover:bg-error/10" onClick={() => setConfirmDeleteBlockId(item.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </IconButton>
                                        </div>
                                    )}
                                </For>
                            </Show>
                        </div>
                    </div>
                </Show>
            </Suspense>

            {/* --- DETALHES DO AGENDAMENTO --- */}
            <Modal isOpen={isModalOpen()} onClose={() => setIsModalOpen(false)} title={t().teamSchedule.details.title}>
                <Show when={selectedAppointment()}>
                    {(appt) => {
                        const profName = professionals()?.find((p: any) => p.id === appt().professional?.id)?.name
                            || appt().professional?.user?.name
                            || t().teamSchedule.details.unknownProfessional;

                        return (
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex items-center gap-3">
                                        <Avatar size="lg" fallbackInitials={(appt().client?.name || "").substring(0, 2).toUpperCase()} />
                                        <div>
                                            <h4 class="text-lg font-bold text-foreground">
                                                {appt().client?.name || t().teamSchedule.defaultClient}
                                            </h4>
                                            <span class="text-xs text-muted-foreground font-mono">#{appt().id.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        appt().status === "CONFIRMED" ? "success"
                                            : appt().status === "PENDING" ? "warning"
                                                : appt().status === "NO_SHOW" ? "error"
                                                    : "default"
                                    }>
                                        {(t().appointments.status as Record<string, string>)[appt().status] ?? appt().status}
                                    </Badge>
                                </div>

                                <div class="bg-muted rounded-md p-4 flex flex-col gap-2 border border-border text-foreground">
                                    <p class="text-sm">
                                        <strong>{t().teamSchedule.details.service}</strong> {appt().service?.name}
                                    </p>
                                    <p class="text-sm">
                                        <strong>{t().teamSchedule.details.dateTime}</strong>{" "}
                                        {formatDate(appt().date)} — {appt().startTime} ({appt().service?.durationMinutes || 60} {t().common.minutesShort})
                                    </p>
                                    <p class="text-sm">
                                        <strong>{t().teamSchedule.details.professional}</strong> {profName}
                                    </p>
                                    <p class="text-sm">
                                        <strong>{t().teamSchedule.details.rescheduleCount}</strong>{" "}
                                        {appt().rescheduleCount ?? 0} / {MAX_RESCHEDULES}
                                    </p>
                                    <ClientReputationBadge clientId={appt().client?.id} />
                                </div>

                                <Show when={appt().proposedDate}>
                                    <div class="p-3 rounded bg-warning/10 border border-warning/30 text-sm">
                                        {t().teamSchedule.details.pendingProposal(formatDate(appt().proposedDate), appt().proposedStartTime)}
                                    </div>
                                </Show>

                                <Show when={remainingReschedules(appt()) === 0}>
                                    <div class="p-3 rounded bg-error/10 border border-error/20 text-sm text-error">
                                        {t().teamSchedule.details.limitReached(MAX_RESCHEDULES)}
                                    </div>
                                </Show>

                                <Show when={!showCancelJustified()}>
                                    <div class="flex flex-col gap-2 mt-2">
                                        <Show when={appt().status === "CONFIRMED"}>
                                            <Button
                                                variant="outline"
                                                class="w-full text-error border-error/30 hover:bg-error/10"
                                                onClick={() => setConfirmNoShowModal({ type: "MARK", id: appt().id })}
                                            >
                                                {t().teamSchedule.details.registerNoShow}
                                            </Button>
                                            <Button variant="outline" class="w-full" onClick={() => setShowCancelJustified(true)}>
                                                {t().teamSchedule.details.cancelWithReason}
                                            </Button>
                                        </Show>

                                        <Show when={appt().status === "NO_SHOW"}>
                                            <Show when={appt().cancelledByRole === "manager_noshow"}>
                                                <div class="text-xs text-center text-muted-foreground mb-1">
                                                    {t().teamSchedule.details.penaltyApplied}
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    class="w-full"
                                                    onClick={() => setConfirmNoShowModal({ type: "REVERT", id: appt().id })}
                                                >
                                                    {t().teamSchedule.details.revertNoShow}
                                                </Button>
                                            </Show>
                                            <Show when={appt().cancelledByRole !== "manager_noshow"}>
                                                <div class="text-xs text-center text-muted-foreground mb-1">
                                                    {t().teamSchedule.details.autoReleased}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    class="w-full text-error border-error/30 hover:bg-error/10 mb-1"
                                                    onClick={() => setConfirmNoShowModal({ type: "MARK", id: appt().id })}
                                                >
                                                    {t().teamSchedule.details.registerNoShow}
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    class="w-full"
                                                    onClick={() => setConfirmNoShowModal({ type: "PRESENCE", id: appt().id })}
                                                >
                                                    {t().teamSchedule.details.registerPresence}
                                                </Button>
                                            </Show>
                                        </Show>

                                        <div class="flex gap-2">
                                            <Show when={canPropose(appt())}>
                                                <Button
                                                    variant="primary"
                                                    class="flex-1 text-center justify-center"
                                                    onClick={() => openProposal(appt())}
                                                >
                                                    {t().teamSchedule.details.proposeNewTime}
                                                </Button>
                                            </Show>
                                            <Button variant="outline" class="flex-1 text-center justify-center" onClick={() => setIsModalOpen(false)}>
                                                {t().common.close}
                                            </Button>
                                        </div>
                                    </div>
                                </Show>

                                <Show when={showCancelJustified()}>
                                    <div class="flex flex-col gap-3 mt-2 bg-card border border-border rounded-lg p-4">
                                        <h5 class="font-bold text-sm">{t().teamSchedule.justifiedCancel.title}</h5>
                                        <Input
                                            labelText={t().teamSchedule.justifiedCancel.reasonLabel}
                                            placeholder={t().teamSchedule.justifiedCancel.reasonPlaceholder}
                                            value={cancelReason()}
                                            onInput={(e: any) => setCancelReason(e.target.value)}
                                        />

                                        <label class="flex items-center gap-2 text-sm cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                checked={affectsReputation()}
                                                onChange={(e: any) => setAffectsReputation(e.target.checked)}
                                                class="rounded text-primary focus:ring-primary h-4 w-4 border-input bg-background"
                                            />
                                            {t().teamSchedule.justifiedCancel.affectsReputation}
                                        </label>

                                        <div class="flex gap-2 mt-4">
                                            <Button variant="outline" class="flex-1" onClick={() => setShowCancelJustified(false)}>
                                                {t().common.back}
                                            </Button>
                                            <Button
                                                variant="primary"
                                                class="flex-1 bg-error hover:bg-error/90 text-error-foreground"
                                                onClick={() => submitCancelJustified(appt().id)}
                                            >
                                                {t().teamSchedule.justifiedCancel.confirm}
                                            </Button>
                                        </div>
                                    </div>
                                </Show>
                            </div>
                        );
                    }}
                </Show>
            </Modal>

            {/* --- PROPOSTA DE NOVO HORÁRIO (RF22/AC3) --- */}
            <Show when={proposalTarget()}>
                <BookingModal
                    isOpen={!!proposalTarget()}
                    mode="propose"
                    appointmentId={proposalTarget().id}
                    initialDate={proposalTarget().date}
                    professionalId={proposalTarget().professional?.id}
                    businessId={proposalTarget().business?.id || getActiveBizId()}
                    serviceId={proposalTarget().service?.id}
                    serviceName={proposalTarget().service?.name || t().teamSchedule.defaultService}
                    durationMinutes={proposalTarget().service?.durationMinutes || 60}
                    onSuccess={refetchAppointments}
                    onClose={() => setProposalTarget(null)}
                />
            </Show>

            {/* --- NOVO BLOQUEIO --- */}
            <Modal isOpen={isCreateBlockOpen()} onClose={() => { setIsCreateBlockOpen(false); setPendingConflictData(null); setCreateError(""); }} title={t().teamSchedule.blocks.modalTitle}>
                <div class="flex flex-col gap-4">
                    <Show when={createError()}>
                        <div class="p-3 rounded bg-error/10 text-error text-sm font-medium">{createError()}</div>
                    </Show>

                    <Show when={pendingConflictData()}>
                        <div class="p-4 rounded bg-warning/20 border border-warning/30 flex flex-col gap-2 text-sm">
                            <p class="font-bold text-warning-foreground">{t().teamSchedule.blocks.pendingConflictTitle}</p>
                            <p>{pendingConflictData().message}</p>
                            <p>{t().teamSchedule.blocks.pendingConflictQuestion}</p>
                            <div class="flex gap-2 mt-2">
                                <Button variant="primary" class="bg-warning text-warning-foreground hover:bg-warning/80" onClick={() => handleSaveBlock(true)}>
                                    {t().teamSchedule.blocks.forceBlock}
                                </Button>
                                <Button variant="outline" onClick={() => setPendingConflictData(null)}>
                                    {t().teamSchedule.blocks.dontForce}
                                </Button>
                            </div>
                        </div>
                    </Show>

                    <Show when={!pendingConflictData()}>
                        <Input labelText={t().teamSchedule.blocks.date} type="date" value={blockDate()} onInput={(e: any) => setBlockDate(e.target.value)} />
                        <div class="flex gap-4">
                            <div class="flex-1">
                                <Input labelText={t().teamSchedule.blocks.start} type="time" value={blockStart()} onInput={(e: any) => setBlockStart(e.target.value)} />
                            </div>
                            <div class="flex-1">
                                <Input labelText={t().teamSchedule.blocks.end} type="time" value={blockEnd()} onInput={(e: any) => setBlockEnd(e.target.value)} />
                            </div>
                        </div>
                        <Input
                            labelText={t().teamSchedule.blocks.reason}
                            placeholder={t().teamSchedule.blocks.reasonPlaceholder}
                            value={blockReason()}
                            onInput={(e: any) => setBlockReason(e.target.value)}
                        />

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-bold text-muted-foreground uppercase">{t().teamSchedule.blocks.affects}</label>
                            <select
                                class="h-10 rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={blockProfId()}
                                onChange={(e: any) => setBlockProfId(e.target.value)}
                            >
                                <option value="">{t().teamSchedule.blocks.wholeBusiness}</option>
                                <For each={professionals() || []}>
                                    {(p: any) => <option value={p.id}>{p.name}</option>}
                                </For>
                            </select>
                        </div>

                        <div class="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setIsCreateBlockOpen(false)}>{t().common.cancel}</Button>
                            <Button variant="primary" onClick={() => handleSaveBlock(false)}>{t().teamSchedule.blocks.save}</Button>
                        </div>
                    </Show>
                </div>
            </Modal>

            {/* --- CONFIRMAÇÃO DE NO-SHOW / PRESENÇA --- */}
            <Show when={confirmNoShowModal()}>
                {(modalData) => (
                    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                            <div class="p-6 flex flex-col items-center text-center gap-4">
                                <div class={`size-16 rounded-full flex items-center justify-center mb-2 ${
                                    modalData().type === "MARK"
                                        ? "bg-red-500/10 text-red-500"
                                        : modalData().type === "PRESENCE"
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "bg-blue-500/10 text-blue-500"
                                }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                </div>
                                <h2 class="text-xl font-bold text-foreground">{noShowCopy(modalData().type).title}</h2>
                                <p class="text-muted-foreground text-sm">{noShowCopy(modalData().type).message}</p>
                            </div>
                            <div class="flex border-t border-border bg-muted/30">
                                <button
                                    class="flex-1 py-4 font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border-r border-border"
                                    onClick={() => setConfirmNoShowModal(null)}
                                >
                                    {t().common.cancel}
                                </button>
                                <button
                                    class={`flex-1 py-4 font-bold transition-colors ${
                                        modalData().type === "MARK"
                                            ? "text-red-500 hover:bg-red-500 hover:text-white"
                                            : modalData().type === "PRESENCE"
                                                ? "text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                : "text-primary hover:bg-primary/10"
                                    }`}
                                    onClick={confirmNoShowAction}
                                >
                                    {noShowCopy(modalData().type).confirm}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Show>

            {/* --- CONFIRMAÇÃO DE RECUSA --- */}
            <Show when={confirmRefuseId()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                        <div class="p-6 flex flex-col items-center text-center gap-4">
                            <div class="size-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </div>
                            <h2 class="text-xl font-bold text-foreground">{t().teamSchedule.pending.refuseTitle}</h2>
                            <p class="text-muted-foreground text-sm">{t().teamSchedule.pending.refuseMessage}</p>
                        </div>
                        <div class="flex border-t border-border bg-muted/30">
                            <button
                                class="flex-1 py-4 font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border-r border-border"
                                onClick={() => setConfirmRefuseId(null)}
                            >
                                {t().common.back}
                            </button>
                            <button
                                class="flex-1 py-4 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                onClick={() => executeRefuseAppointment(confirmRefuseId()!)}
                            >
                                {t().teamSchedule.pending.refuseConfirm}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>

            {/* --- CONFIRMAÇÃO DE REMOÇÃO DE BLOQUEIO --- */}
            <Show when={confirmDeleteBlockId()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                        <div class="p-6 flex flex-col items-center text-center gap-4">
                            <div class="size-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </div>
                            <h2 class="text-xl font-bold text-foreground">{t().teamSchedule.blocks.deleteTitle}</h2>
                            <p class="text-muted-foreground text-sm">{t().teamSchedule.blocks.deleteMessage}</p>
                        </div>
                        <div class="flex border-t border-border bg-muted/30">
                            <button
                                class="flex-1 py-4 font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border-r border-border"
                                onClick={() => setConfirmDeleteBlockId(null)}
                            >
                                {t().common.back}
                            </button>
                            <button
                                class="flex-1 py-4 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                onClick={() => executeDeleteException(confirmDeleteBlockId()!)}
                            >
                                {t().teamSchedule.blocks.deleteConfirm}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
}