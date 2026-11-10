import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    onMount,
    Show,
    Suspense,
} from "solid-js";
import { CalendarIcon, ClockIcon } from "../components/Icons/Icons";
import { ComboRequestsPanel } from "../components/Layout/ComboRequestPanel";
import {
    type Appointment as GridAppointment,
    type Professional,
    ScheduleGrid,
} from "../components/Layout/ScheduleGrid";
import { type DayCount, WeekStrip } from "../components/Layout/WeekStrip";
import { Avatar } from "../components/Widgets/Avatar";
import { Badge } from "../components/Widgets/Badge";
import { BookingModal } from "../components/Widgets/BookingModal";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import {
    CustomizeViewDrawer,
    SavedPresetsBar,
} from "../components/Widgets/CustomizeViewDrawer";
import { IconButton } from "../components/Widgets/IconButton";
import { Input } from "../components/Widgets/Input";
import { Modal } from "../components/Widgets/Modal";
import { Tabs } from "../components/Widgets/Tabs";
import type { ScreenCustomizationDefaults } from "../core/application/customization/CustomizeScreenUseCase";
import { container } from "../core/container";
import type {
    Appointment as DomainAppointment,
    SavedFilterPreset,
    ScheduleException,
    ScreenCustomizationConfig,
} from "../core/domain/entities/models";
import { AppointmentPolicy } from "../core/domain/policies/AppointmentPolicy";
import {
    formatDate,
    formatInteger,
    formatMoney,
    formatMoneyHint,
    formatTime,
    localizeDomain,
    t,
} from "../core/i18n";
import { ApiError } from "../services/api";
import {
    appointmentsService,
    MAX_RESCHEDULES,
} from "../services/appointments.service";
import { availabilityService } from "../services/availability.service";
import { businessProfessionalService } from "../services/business-professional.service";
import { activeBusiness, getActiveBizId } from "../store/appState";
import { toast } from "../store/toastStore";

type NoShowAction = "MARK" | "REVERT" | "PRESENCE";

const TEAM_SCHEDULE_DEFAULTS: ScreenCustomizationDefaults = {
    screenId: "team_schedule",
    viewMode: "grid",
    density: "comfortable",
    visibleColumns: [
        "code",
        "time",
        "duration",
        "client",
        "service",
        "price",
        "professional",
        "status",
        "reschedules",
        "actions",
    ],
    widgets: [
        { id: "weekStrip", enabled: true, order: 0 },
        { id: "kpis", enabled: true, order: 1 },
        { id: "revenue", enabled: true, order: 2 },
        { id: "combosQueue", enabled: false, order: 3 },
        { id: "blocksSummary", enabled: false, order: 4 },
    ],
};

const ClientReputationBadge = (props: { clientId?: string }) => {
    const [rep] = createResource(
        () => props.clientId,
        async (id) => {
            if (!id) return null;
            try {
                return await appointmentsService.getClientReputation(id);
            } catch {
                return null;
            }
        },
    );

    return (
        <Show when={rep()}>
            {(r) => (
                <div class="mt-1.5 flex flex-wrap gap-2">
                    <Show when={r().noShowCount > 0}>
                        <span
                            class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                r().noShowCount >= 3
                                    ? "border-error/20 bg-error/10 text-error"
                                    : "border-warning/20 bg-warning/10 text-warning-foreground"
                            }`}
                        >
                            {r().noShowCount >= 3
                                ? t().teamSchedule.reputation.highRisk(r().noShowCount)
                                : t().teamSchedule.reputation.recentNoShows(r().noShowCount)}
                        </span>
                    </Show>
                    <Show when={r().successStreak > 0}>
                        <span class="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
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
    const [statusFilter, setStatusFilter] = createSignal<string>("ALL");
    const [selectedDate, setSelectedDate] = createSignal(
        new Date().toISOString().split("T")[0],
    );
    const [isCustomizeOpen, setIsCustomizeOpen] = createSignal(false);

    const scopeId = () => activeBusiness()?.businessId || "default";
    const [viewConfig, setViewConfig] = createSignal<ScreenCustomizationConfig>(
        container.customizeScreenUseCase.load(TEAM_SCHEDULE_DEFAULTS, scopeId()),
    );

    const applyPresetValues = (preset: SavedFilterPreset) => {
        const vals = preset.values;
        if (typeof vals.activeTab === "string") setActiveTab(vals.activeTab);
        if (typeof vals.professionalIdFilter === "string") {
            setProfessionalIdFilter(vals.professionalIdFilter || null);
        }
        if (typeof vals.statusFilter === "string") {
            setStatusFilter(vals.statusFilter);
        }
        setViewConfig((prev) => ({ ...prev, activePresetId: preset.id }));
    };

    createEffect(() => {
        const loaded = container.customizeScreenUseCase.load(
            TEAM_SCHEDULE_DEFAULTS,
            scopeId(),
        );
        setViewConfig(loaded);
        const defaultPreset = loaded.presets.find((p) => p.isDefault);
        if (defaultPreset) {
            applyPresetValues(defaultPreset);
        }
    });

    const handleSaveCustomization = () => {
        const saved = container.customizeScreenUseCase.save(viewConfig(), scopeId());
        setViewConfig(saved);
        toast.success(t().customization.savedToast);
        setIsCustomizeOpen(false);
    };

    const handleResetCustomization = () => {
        const reset = container.customizeScreenUseCase.reset(
            TEAM_SCHEDULE_DEFAULTS,
            scopeId(),
        );
        setViewConfig(reset);
        toast.info(t().customization.resetToast);
    };

    const handleCreatePreset = (name: string, isDefault: boolean) => {
        const saved = container.customizeScreenUseCase.savePreset(
            viewConfig(),
            name,
            {
                activeTab: activeTab(),
                professionalIdFilter: professionalIdFilter() || "",
                statusFilter: statusFilter(),
            },
            isDefault,
            scopeId(),
        );
        setViewConfig(saved);
        toast.success(t().customization.presetSavedToast);
    };

    const handleDeletePreset = (presetId: string) => {
        const updated = container.customizeScreenUseCase.deletePreset(
            viewConfig(),
            presetId,
            scopeId(),
        );
        setViewConfig(updated);
        toast.info(t().customization.presetDeletedToast);
    };

    const [professionals] = createResource(
        () => activeBusiness()?.businessId,
        async () => {
            const list = await businessProfessionalService.getProfessionals();
            return list.map((item) => {
                const name =
                    item.professional?.user?.name ||
                    t().teamSchedule.defaultProfessional;
                return {
                    id: item.professional?.id || item.id,
                    name,
                    initials: name.substring(0, 2).toUpperCase(),
                    avatarUrl: item.professional?.photoUrl,
                } satisfies Professional;
            });
        },
    );

    const [rawAppointments, { refetch: refetchAppointments }] = createResource(
        () => ({ date: selectedDate(), biz: getActiveBizId() }),
        async ({ date, biz }) => {
            return await appointmentsService.getAppointments({
                date,
                businessId: biz || undefined,
            });
        },
    );

    const [visibleRange, setVisibleRange] = createSignal<string[]>([]);

    const [dayCounts, { refetch: refetchDayCounts }] = createResource(
        visibleRange,
        async (dates) => {
            if (dates.length === 0) return {} as Record<string, DayCount>;
            const counts: Record<string, DayCount> = {};
            for (const date of dates) counts[date] = { pending: 0, confirmed: 0 };

            try {
                const list = await appointmentsService.getAppointments({
                    businessId: getActiveBizId() || undefined,
                    dateFrom: dates[0],
                    dateTo: dates[dates.length - 1],
                });

                for (const appt of list) {
                    const day = counts[appt.date];
                    if (!day) continue;
                    if (appt.status === "PENDING") day.pending++;
                    else if (appt.status === "CONFIRMED") day.confirmed++;
                }
            } catch {}
            return counts;
        },
    );

    const refreshSchedules = () => {
        refetchAppointments();
        refetchDayCounts();
    };

    const appointments = createMemo<GridAppointment[]>(() =>
        (rawAppointments() || []).map((a) => ({
            id: a.id,
            professionalId: a.professional?.id || a.professionalId,
            clientName:
                a.client?.name ||
                a.client?.user?.name ||
                t().teamSchedule.defaultClient,
            service: localizeDomain.serviceName(
                a.service?.name || t().teamSchedule.defaultService,
            ),
            startTime: a.startTime,
            durationMins: a.service?.durationMinutes || 60,
            date: a.date,
            status: (a.status || "PENDING").toLowerCase() as
                | "confirmed"
                | "pending"
                | "completed"
                | "no_show",
            colorClass:
                a.status === "PENDING"
                    ? "bg-warning text-warning-foreground"
                    : a.status === "NO_SHOW"
                      ? "bg-error text-error-foreground"
                      : "bg-primary text-primary-foreground",
            type: "appointment",
        })),
    );

    const rawById = (id: string): DomainAppointment | undefined =>
        (rawAppointments() || []).find((a) => a.id === id);

    const [exceptions, { refetch: refetchExceptions }] = createResource(
        selectedDate,
        async (date): Promise<ScheduleException[]> => {
            try {
                return await availabilityService.getExceptions({ date });
            } catch {
                return [];
            }
        },
    );

    const filteredProfessionals = createMemo(() => {
        const list = professionals() || [];
        if (!professionalIdFilter()) return list;
        return list.filter((p) => p.id === professionalIdFilter());
    });

    const filteredDomainAppointments = createMemo(() => {
        const list = rawAppointments() || [];
        return list.filter((a) => {
            if (
                professionalIdFilter() &&
                (a.professional?.id || a.professionalId) !== professionalIdFilter()
            ) {
                return false;
            }
            if (statusFilter() !== "ALL" && a.status !== statusFilter()) {
                return false;
            }
            return true;
        });
    });

    const confirmedSchedules = createMemo(() =>
        appointments().filter(
            (a) =>
                a.status === "confirmed" ||
                a.status === "completed" ||
                a.status === "no_show",
        ),
    );
    const pendingSchedules = createMemo(() =>
        appointments().filter((a) => a.status === "pending"),
    );

    const dailyStats = createMemo(() => {
        const all = rawAppointments() || [];
        let confirmed = 0;
        let pending = 0;
        let completed = 0;
        let noShow = 0;
        let revenueBrl = 0;

        for (const a of all) {
            if (a.status === "CONFIRMED") {
                confirmed++;
                revenueBrl += Number(a.service?.price ?? 0);
            } else if (a.status === "PENDING") {
                pending++;
            } else if (a.status === "COMPLETED") {
                completed++;
                revenueBrl += Number(a.service?.price ?? 0);
            } else if (a.status === "NO_SHOW") {
                noShow++;
            }
        }
        return { confirmed, pending, completed, noShow, revenueBrl };
    });

    const gridEvents = createMemo(() => {
        const apps = confirmedSchedules().filter((a) => {
            if (statusFilter() === "ALL") return true;
            return a.status?.toUpperCase() === statusFilter();
        });
        const blocks: GridAppointment[] = (exceptions() || []).map((ex) => {
            const [sh, sm] = (ex.startTime || "00:00").split(":").map(Number);
            const [eh, em] = (ex.endTime || "00:00").split(":").map(Number);
            const dur = eh * 60 + em - (sh * 60 + sm);
            return {
                id: ex.id,
                professionalId: ex.professional?.id || ex.professionalId || undefined,
                reason: ex.reason,
                startTime: ex.startTime,
                durationMins: dur > 0 ? dur : 60,
                type: "block",
            };
        });
        return [...apps, ...blocks];
    });

    // --- Modais de confirmação -------------------------------------------
    const [confirmRefuseId, setConfirmRefuseId] = createSignal<string | null>(null);
    const [confirmNoShowModal, setConfirmNoShowModal] = createSignal<{
        type: NoShowAction;
        id: string;
    } | null>(null);
    const [confirmDeleteBlockId, setConfirmDeleteBlockId] = createSignal<string | null>(
        null,
    );

    const handleUpdateStatus = async (id: string, status: string) => {
        if (status === "CANCELLED") {
            setConfirmRefuseId(id);
            return;
        }
        try {
            await appointmentsService.updateStatus(id, status);
            refreshSchedules();
            if (status === "COMPLETED") {
                toast.success(t().teamSchedule.statusUpdated.completed);
                setIsModalOpen(false);
            } else {
                toast.success(t().teamSchedule.statusUpdated.approved);
            }
        } catch (err: any) {
            toast.error(
                localizeDomain.apiError(
                    err?.message,
                    t().teamSchedule.statusUpdated.error,
                ),
            );
        }
    };

    const executeRefuseAppointment = async (id: string) => {
        try {
            await appointmentsService.updateStatus(id, "CANCELLED");
            refreshSchedules();
            toast.success(t().teamSchedule.statusUpdated.rejected);
        } catch (err: any) {
            toast.error(
                localizeDomain.apiError(
                    err?.message,
                    t().teamSchedule.statusUpdated.refuseError,
                ),
            );
        } finally {
            setConfirmRefuseId(null);
        }
    };

    const executeMarkNoShow = async (id: string) => {
        try {
            await appointmentsService.markNoShow(id);
            refreshSchedules();
            toast.success(t().teamSchedule.noShowModal.markSuccess);
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(
                    e?.message,
                    t().teamSchedule.noShowModal.markError,
                ),
            );
        } finally {
            setConfirmNoShowModal(null);
        }
    };

    const executeRevertNoShow = async (id: string) => {
        try {
            await appointmentsService.revertNoShow(id);
            refreshSchedules();
            toast.success(t().teamSchedule.noShowModal.revertSuccess);
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(
                    e?.message,
                    t().teamSchedule.noShowModal.revertError,
                ),
            );
        } finally {
            setConfirmNoShowModal(null);
        }
    };

    const confirmNoShowAction = () => {
        const data = confirmNoShowModal();
        if (!data) return;
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
    const [selectedAppointment, setSelectedAppointment] =
        createSignal<DomainAppointment | null>(null);
    const [showCancelJustified, setShowCancelJustified] = createSignal(false);
    const [cancelReason, setCancelReason] = createSignal("");
    const [affectsReputation, setAffectsReputation] = createSignal(false);

    const openDetailsForDomain = (raw: DomainAppointment) => {
        setSelectedAppointment(raw);
        setShowCancelJustified(false);
        setCancelReason("");
        setAffectsReputation(false);
        setIsModalOpen(true);
    };

    const handleModalOpen = (appt: GridAppointment) => {
        if (appt.type === "block") return;
        const raw = rawById(appt.id);
        if (raw) openDetailsForDomain(raw);
    };

    const submitCancelJustified = async (id: string) => {
        if (!cancelReason().trim()) {
            toast.error(t().teamSchedule.justifiedCancel.reasonRequired);
            return;
        }
        try {
            await appointmentsService.cancelJustified(
                id,
                cancelReason().trim(),
                affectsReputation(),
            );
            refreshSchedules();
            toast.success(t().teamSchedule.justifiedCancel.success);
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(
                    e?.message,
                    t().teamSchedule.justifiedCancel.error,
                ),
            );
        }
    };

    // --- Proposta de novo horário (RF22/AC3) ------------------------------
    const [proposalTarget, setProposalTarget] =
        createSignal<DomainAppointment | null>(null);

    const remainingReschedules = (appt?: DomainAppointment | null) =>
        appt ? AppointmentPolicy.remainingReschedules(appt) : 0;

    const canPropose = (appt?: DomainAppointment | null) =>
        appt ? AppointmentPolicy.canProposeReschedule(appt) : false;

    const openProposal = (appt?: DomainAppointment | null) => {
        if (!appt) return;
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
        if (!blockDate() || !blockStart() || !blockEnd() || !blockReason().trim()) {
            setCreateError(t().teamSchedule.blocks.requiredFields);
            return;
        }
        try {
            const finalStart =
                blockStart().length === 5 ? `${blockStart()}:00` : blockStart();
            const finalEnd =
                blockEnd().length === 5 ? `${blockEnd()}:00` : blockEnd();

            await availabilityService.createException({
                date: blockDate(),
                startTime: finalStart,
                endTime: finalEnd,
                reason: blockReason().trim(),
                professionalId: blockProfId() || undefined,
                forceOverwritePending: forceOverwrite,
            });

            refetchExceptions();
            refreshSchedules();
            setIsCreateBlockOpen(false);
            setPendingConflictData(null);
            setBlockStart("");
            setBlockEnd("");
            setBlockReason("");
            setBlockProfId("");
            toast.success(t().teamSchedule.blocks.created);
        } catch (e: any) {
            if (e instanceof ApiError) {
                if (e.status === 412) setPendingConflictData(e.data);
                else if (e.status === 409)
                    setCreateError(t().teamSchedule.blocks.confirmedConflict);
                else
                    setCreateError(
                        localizeDomain.apiError(
                            e.message,
                            t().teamSchedule.blocks.createError,
                        ),
                    );
            } else {
                setCreateError(t().teamSchedule.blocks.createError);
            }
        }
    };

    const executeDeleteException = async (id: string) => {
        try {
            await availabilityService.deleteException(id);
            refetchExceptions();
            toast.success(t().teamSchedule.blocks.deleted);
        } catch {
            toast.error(t().teamSchedule.blocks.deleteError);
        } finally {
            setConfirmDeleteBlockId(null);
        }
    };

    // --- Expediente -------------------------------------------------------
    const diasDaSemana = () => {
        const d = t().teamSchedule.hours.days;
        return [
            { id: 1, label: d.mon },
            { id: 2, label: d.tue },
            { id: 3, label: d.wed },
            { id: 4, label: d.thu },
            { id: 5, label: d.fri },
            { id: 6, label: d.sat },
            { id: 0, label: d.sun },
        ];
    };

    const [diasSelecionados, setDiasSelecionados] = createSignal([1, 2, 3, 4, 5, 6]);
    const [abertura, setAbertura] = createSignal("08:00");
    const [fechamento, setFechamento] = createSignal("18:00");
    const [inicioAlmoco, setInicioAlmoco] = createSignal("12:00");
    const [fimAlmoco, setFimAlmoco] = createSignal("13:00");
    const [isSavingHours, setIsSavingHours] = createSignal(false);

    onMount(async () => {
        const bizId = getActiveBizId();
        if (bizId) {
            try {
                const hours = await availabilityService.getOperatingHours(bizId);
                if (hours.length > 0) {
                    const openDays = hours.filter((h) => h.isOpen);
                    if (openDays.length > 0) {
                        setAbertura(openDays[0].startTime.substring(0, 5));
                        setFechamento(openDays[0].endTime.substring(0, 5));
                        setDiasSelecionados(openDays.map((h) => h.dayOfWeek));
                    }
                }
            } catch (e) {
                console.error("Failed to fetch operating hours", e);
            }
        }
    });

    const toggleDia = (diaId: number) => {
        if (diasSelecionados().includes(diaId)) {
            setDiasSelecionados(diasSelecionados().filter((d) => d !== diaId));
        } else {
            setDiasSelecionados([...diasSelecionados(), diaId]);
        }
    };

    const handleSaveOperatingHours = async () => {
        const businessId = getActiveBizId();
        if (!businessId) {
            toast.error(t().teamSchedule.hours.noBusiness);
            return;
        }

        setIsSavingHours(true);
        try {
            const promises = [0, 1, 2, 3, 4, 5, 6].map((diaId) =>
                availabilityService.saveOperatingHour({
                    businessId,
                    dayOfWeek: diaId,
                    startTime: `${abertura()}:00`,
                    endTime: `${fechamento()}:00`,
                    isOpen: diasSelecionados().includes(diaId),
                }),
            );
            await Promise.all(promises);
            toast.success(t().teamSchedule.hours.saved);
        } catch (err: any) {
            toast.error(
                localizeDomain.apiError(
                    err?.message,
                    t().teamSchedule.hours.saveError,
                ),
            );
        } finally {
            setIsSavingHours(false);
        }
    };

    const enabledWidgets = createMemo(() =>
        [...viewConfig().widgets]
            .filter((w) => w.enabled)
            .sort((a, b) => a.order - b.order),
    );

    const hasColumn = (colId: string) =>
        viewConfig().visibleColumns.includes(colId);

    const profNameFor = (appt: DomainAppointment) =>
        professionals()?.find(
            (p) => p.id === (appt.professional?.id || appt.professionalId),
        )?.name ||
        appt.professional?.user?.name ||
        t().teamSchedule.details.unknownProfessional;

    const statusBadgeVariant = (status: string) => {
        if (status === "CONFIRMED" || status === "COMPLETED") return "success";
        if (status === "PENDING") return "warning";
        if (status === "NO_SHOW" || status === "CANCELLED") return "error";
        return "default";
    };

    const availableColumns = () => [
        { id: "code", label: t().teamSchedule.columns.code },
        { id: "time", label: t().teamSchedule.columns.time },
        { id: "duration", label: t().teamSchedule.columns.duration },
        { id: "client", label: t().teamSchedule.columns.client },
        { id: "service", label: t().teamSchedule.columns.service },
        { id: "price", label: t().teamSchedule.columns.price },
        { id: "professional", label: t().teamSchedule.columns.professional },
        { id: "status", label: t().teamSchedule.columns.status },
        { id: "reschedules", label: t().teamSchedule.columns.reschedules },
        { id: "actions", label: t().teamSchedule.columns.actions },
    ];

    const widgetLabels = () => ({
        weekStrip: t().teamSchedule.widgets.weekStrip,
        kpis: t().teamSchedule.widgets.kpis,
        revenue: t().teamSchedule.widgets.revenue,
        combosQueue: t().teamSchedule.widgets.combosQueue,
        blocksSummary: t().teamSchedule.widgets.blocksSummary,
    });

    return (
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 bg-background p-4 text-foreground sm:p-6 lg:p-8">
            <header class="flex flex-col gap-4">
                <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 class="text-2xl font-bold sm:text-3xl">
                            {t().teamSchedule.title}
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">
                            {t().teamSchedule.subtitle}
                        </p>
                    </div>
                    <SavedPresetsBar
                        presets={viewConfig().presets}
                        activePresetId={viewConfig().activePresetId}
                        onSelect={applyPresetValues}
                        onOpenCustomize={() => setIsCustomizeOpen(true)}
                    />
                </div>

                <For each={enabledWidgets()}>
                    {(widget) => (
                        <>
                            <Show when={widget.id === "weekStrip"}>
                                <WeekStrip
                                    selectedDate={selectedDate()}
                                    onSelect={(d) => {
                                        setSelectedDate(d);
                                        setBlockDate(d);
                                    }}
                                    counts={dayCounts()}
                                    onRangeChange={setVisibleRange}
                                    loading={dayCounts.loading}
                                />
                            </Show>

                            <Show when={widget.id === "kpis"}>
                                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <Card class="p-4">
                                        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t().teamSchedule.widgets.confirmedCount}
                                        </p>
                                        <p class="mt-1 text-2xl font-extrabold text-primary">
                                            {formatInteger(dailyStats().confirmed)}
                                        </p>
                                    </Card>
                                    <Card class="p-4">
                                        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t().teamSchedule.widgets.pendingCount}
                                        </p>
                                        <p class="mt-1 text-2xl font-extrabold text-warning">
                                            {formatInteger(dailyStats().pending)}
                                        </p>
                                    </Card>
                                    <Card class="p-4">
                                        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t().teamSchedule.widgets.completedCount}
                                        </p>
                                        <p class="mt-1 text-2xl font-extrabold text-success">
                                            {formatInteger(dailyStats().completed)}
                                        </p>
                                    </Card>
                                    <Card class="p-4">
                                        <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t().teamSchedule.widgets.noShowCount}
                                        </p>
                                        <p class="mt-1 text-2xl font-extrabold text-error">
                                            {formatInteger(dailyStats().noShow)}
                                        </p>
                                    </Card>
                                </div>
                            </Show>

                            <Show when={widget.id === "revenue"}>
                                <Card class="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t().teamSchedule.widgets.revenue}
                                        </p>
                                        <p class="text-xs text-muted-foreground">
                                            {t().teamSchedule.widgets.estimatedTotal} ·{" "}
                                            {formatDate(selectedDate())}
                                        </p>
                                    </div>
                                    <span
                                        class="text-2xl font-black text-foreground"
                                        title={
                                            formatMoneyHint(dailyStats().revenueBrl) ??
                                            undefined
                                        }
                                    >
                                        {formatMoney(dailyStats().revenueBrl)}
                                    </span>
                                </Card>
                            </Show>

                            <Show when={widget.id === "combosQueue" && getActiveBizId()}>
                                <section class="flex flex-col gap-2">
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {t().combos.requestPanel.title}
                                    </h3>
                                    <ComboRequestsPanel businessId={getActiveBizId() || ""} />
                                </section>
                            </Show>

                            <Show when={widget.id === "blocksSummary"}>
                                <Card class="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t().teamSchedule.widgets.blocksSummary}
                                        </p>
                                        <p class="text-sm text-foreground">
                                            {t().teamSchedule.widgets.activeBlocks}:{" "}
                                            <strong>
                                                {formatInteger((exceptions() || []).length)}
                                            </strong>
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setActiveTab("bloqueios")}
                                    >
                                        {t().teamSchedule.tabs.blocks}
                                    </Button>
                                </Card>
                            </Show>
                        </>
                    )}
                </For>
            </header>

            <Tabs
                activeValue={activeTab()}
                onChange={setActiveTab}
                items={[
                    { label: t().teamSchedule.tabs.grid, value: "grade" },
                    {
                        label: t().teamSchedule.tabs.pending,
                        value: "pendentes",
                        badge: pendingSchedules().length || undefined,
                    },
                    { label: t().teamSchedule.tabs.hours, value: "horario" },
                    { label: t().teamSchedule.tabs.blocks, value: "bloqueios" },
                ]}
            />

            <Suspense
                fallback={
                    <div class="p-10 text-center text-muted-foreground">
                        {t().teamSchedule.loading}
                    </div>
                }
            >
                <Show when={activeTab() === "grade"}>
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="flex max-w-full gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    type="button"
                                    class={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                        !professionalIdFilter()
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    }`}
                                    onClick={() => setProfessionalIdFilter(null)}
                                >
                                    {t().teamSchedule.allProfessionals}
                                </button>
                                <For each={professionals() || []}>
                                    {(prof) => (
                                        <button
                                            type="button"
                                            class={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                                                professionalIdFilter() === prof.id
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-card text-foreground hover:bg-secondary"
                                            }`}
                                            onClick={() => setProfessionalIdFilter(prof.id)}
                                        >
                                            <Avatar
                                                size="sm"
                                                src={prof.avatarUrl}
                                                fallbackInitials={prof.initials}
                                            />
                                            {prof.name}
                                        </button>
                                    )}
                                </For>
                            </div>

                            <div class="flex flex-wrap items-center gap-2">
                                <select
                                    value={statusFilter()}
                                    onChange={(e) => setStatusFilter(e.currentTarget.value)}
                                    class="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="ALL">{t().appointments.filters.all}</option>
                                    <option value="CONFIRMED">
                                        {t().appointments.filters.confirmed}
                                    </option>
                                    <option value="PENDING">
                                        {t().appointments.filters.pending}
                                    </option>
                                    <option value="COMPLETED">
                                        {t().appointments.filters.completed}
                                    </option>
                                    <option value="NO_SHOW">
                                        {t().appointments.status.NO_SHOW}
                                    </option>
                                </select>

                                <div class="inline-flex rounded-lg border border-border bg-card p-0.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setViewConfig((c) => ({ ...c, viewMode: "grid" }))
                                        }
                                        class={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                                            viewConfig().viewMode === "grid"
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {t().customization.modes.grid}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setViewConfig((c) => ({ ...c, viewMode: "table" }))
                                        }
                                        class={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                                            viewConfig().viewMode === "table"
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {t().customization.modes.table}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Show
                            when={viewConfig().viewMode === "table"}
                            fallback={
                                <ScheduleGrid
                                    professionals={filteredProfessionals()}
                                    appointments={gridEvents()}
                                    startHour={parseInt(abertura().split(":")[0]) || 8}
                                    endHour={parseInt(fechamento().split(":")[0]) || 18}
                                    compact={viewConfig().density === "compact"}
                                    onAppointmentClick={handleModalOpen}
                                />
                            }
                        >
                            <Card class="overflow-hidden p-0">
                                <div class="overflow-x-auto">
                                    <table class="w-full border-collapse text-left text-sm">
                                        <thead class="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <tr>
                                                <Show when={hasColumn("code")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.code}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("time")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.time}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("duration")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.duration}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("client")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.client}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("service")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.service}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("price")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.price}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("professional")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.professional}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("status")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.status}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("reschedules")}>
                                                    <th class="px-4 py-3">
                                                        {t().teamSchedule.columns.reschedules}
                                                    </th>
                                                </Show>
                                                <Show when={hasColumn("actions")}>
                                                    <th class="px-4 py-3 text-right">
                                                        {t().teamSchedule.columns.actions}
                                                    </th>
                                                </Show>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-border">
                                            <Show
                                                when={filteredDomainAppointments().length > 0}
                                                fallback={
                                                    <tr>
                                                        <td
                                                            colSpan={
                                                                viewConfig().visibleColumns.length
                                                            }
                                                            class="px-4 py-10 text-center text-muted-foreground"
                                                        >
                                                            {t().teamSchedule.pending.empty}
                                                        </td>
                                                    </tr>
                                                }
                                            >
                                                <For each={filteredDomainAppointments()}>
                                                    {(item) => {
                                                        const rowPad = () =>
                                                            viewConfig().density === "compact"
                                                                ? "px-3 py-2"
                                                                : "px-4 py-3.5";
                                                        return (
                                                            <tr
                                                                class="cursor-pointer transition-colors hover:bg-secondary/40"
                                                                onClick={() =>
                                                                    openDetailsForDomain(item)
                                                                }
                                                            >
                                                                <Show when={hasColumn("code")}>
                                                                    <td
                                                                        class={`${rowPad()} font-mono text-xs text-muted-foreground`}
                                                                    >
                                                                        #{item.id.substring(0, 6)}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("time")}>
                                                                    <td
                                                                        class={`${rowPad()} font-semibold text-foreground`}
                                                                    >
                                                                        {formatTime(item.startTime)}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("duration")}>
                                                                    <td
                                                                        class={`${rowPad()} text-muted-foreground`}
                                                                    >
                                                                        {item.service
                                                                            ?.durationMinutes ||
                                                                            60}{" "}
                                                                        {t().common.minutesShort}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("client")}>
                                                                    <td
                                                                        class={`${rowPad()} font-medium text-foreground`}
                                                                    >
                                                                        {item.client?.name ||
                                                                            item.client?.user
                                                                                ?.name ||
                                                                            t().teamSchedule
                                                                                .defaultClient}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("service")}>
                                                                    <td class={rowPad()}>
                                                                        {localizeDomain.serviceName(
                                                                            item.service?.name ||
                                                                                t().teamSchedule
                                                                                    .defaultService,
                                                                        )}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("price")}>
                                                                    <td
                                                                        class={`${rowPad()} font-semibold text-foreground`}
                                                                        title={
                                                                            formatMoneyHint(
                                                                                Number(
                                                                                    item.service
                                                                                        ?.price ??
                                                                                        0,
                                                                                ),
                                                                            ) ?? undefined
                                                                        }
                                                                    >
                                                                        {formatMoney(
                                                                            Number(
                                                                                item.service
                                                                                    ?.price ?? 0,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </Show>
                                                                <Show
                                                                    when={hasColumn("professional")}
                                                                >
                                                                    <td
                                                                        class={`${rowPad()} text-muted-foreground`}
                                                                    >
                                                                        {profNameFor(item)}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("status")}>
                                                                    <td class={rowPad()}>
                                                                        <Badge
                                                                            variant={statusBadgeVariant(
                                                                                item.status,
                                                                            )}
                                                                        >
                                                                            {(
                                                                                t().appointments
                                                                                    .status as Record<
                                                                                    string,
                                                                                    string
                                                                                >
                                                                            )[item.status] ??
                                                                                item.status}
                                                                        </Badge>
                                                                    </td>
                                                                </Show>
                                                                <Show
                                                                    when={hasColumn("reschedules")}
                                                                >
                                                                    <td
                                                                        class={`${rowPad()} text-xs text-muted-foreground`}
                                                                    >
                                                                        {item.rescheduleCount ?? 0}/
                                                                        {MAX_RESCHEDULES}
                                                                    </td>
                                                                </Show>
                                                                <Show when={hasColumn("actions")}>
                                                                    <td
                                                                        class={`${rowPad()} text-right`}
                                                                        onClick={(e) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                openDetailsForDomain(
                                                                                    item,
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                t().teamSchedule
                                                                                    .details.title
                                                                            }
                                                                        </Button>
                                                                    </td>
                                                                </Show>
                                                            </tr>
                                                        );
                                                    }}
                                                </For>
                                            </Show>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </Show>
                    </div>
                </Show>

                <Show when={activeTab() === "pendentes"}>
                    <div class="flex flex-col gap-4">
                        <Show
                            when={!rawAppointments.loading}
                            fallback={
                                <div class="p-8 text-center text-muted-foreground">
                                    {t().teamSchedule.pending.loading}
                                </div>
                            }
                        >
                            <Show
                                when={pendingSchedules().length > 0}
                                fallback={
                                    <div class="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
                                        {t().teamSchedule.pending.empty}
                                    </div>
                                }
                            >
                                <For each={pendingSchedules()}>
                                    {(item) => {
                                        const profName = () =>
                                            professionals()?.find(
                                                (p) => p.id === item.professionalId,
                                            )?.name || t().teamSchedule.defaultProfessional;
                                        const raw = () => rawById(item.id);
                                        return (
                                            <div class="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
                                                <div>
                                                    <h4 class="font-bold text-foreground">
                                                        {item.clientName}
                                                    </h4>
                                                    <p class="text-sm text-muted-foreground">
                                                        {item.service} · {profName()}
                                                    </p>
                                                    <ClientReputationBadge
                                                        clientId={raw()?.client?.id}
                                                    />
                                                    <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                        <span class="flex items-center gap-1">
                                                            <CalendarIcon class="size-3.5" />
                                                            {item.date
                                                                ? formatDate(item.date)
                                                                : ""}
                                                        </span>
                                                        <span class="flex items-center gap-1">
                                                            <ClockIcon class="size-3.5" />
                                                            {formatTime(item.startTime)}
                                                        </span>
                                                    </div>
                                                    <Show when={raw()?.proposedDate}>
                                                        <p class="mt-2 text-xs text-warning">
                                                            {t().teamSchedule.pending.proposalSent(
                                                                formatDate(
                                                                    raw()?.proposedDate || "",
                                                                ),
                                                                formatTime(
                                                                    raw()?.proposedStartTime ||
                                                                        "",
                                                                ),
                                                            )}
                                                        </p>
                                                    </Show>
                                                </div>
                                                <div class="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() =>
                                                            handleUpdateStatus(
                                                                item.id,
                                                                "CONFIRMED",
                                                            )
                                                        }
                                                    >
                                                        {t().teamSchedule.pending.approve}
                                                    </Button>
                                                    <Show when={canPropose(raw())}>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => openProposal(raw())}
                                                        >
                                                            {t().teamSchedule.pending.propose}
                                                        </Button>
                                                    </Show>
                                                    <Button
                                                        variant="outline"
                                                        class="border-error/20 text-error hover:bg-error/10"
                                                        onClick={() =>
                                                            handleUpdateStatus(
                                                                item.id,
                                                                "CANCELLED",
                                                            )
                                                        }
                                                    >
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
                                                    type="button"
                                                    onClick={() => toggleDia(dia.id)}
                                                    class={`cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                                                        diasSelecionados().includes(dia.id)
                                                            ? "border-primary bg-primary text-primary-foreground"
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
                                    <Input
                                        labelText={t().teamSchedule.hours.opening}
                                        type="time"
                                        value={abertura()}
                                        onInput={(e) => setAbertura(e.currentTarget.value)}
                                    />
                                    <Input
                                        labelText={t().teamSchedule.hours.closing}
                                        type="time"
                                        value={fechamento()}
                                        onInput={(e) => setFechamento(e.currentTarget.value)}
                                    />
                                    <Input
                                        labelText={t().teamSchedule.hours.lunchStart}
                                        type="time"
                                        value={inicioAlmoco()}
                                        onInput={(e) =>
                                            setInicioAlmoco(e.currentTarget.value)
                                        }
                                    />
                                    <Input
                                        labelText={t().teamSchedule.hours.lunchEnd}
                                        type="time"
                                        value={fimAlmoco()}
                                        onInput={(e) => setFimAlmoco(e.currentTarget.value)}
                                    />
                                </div>

                                <div class="pt-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveOperatingHours}
                                        disabled={isSavingHours()}
                                    >
                                        {isSavingHours()
                                            ? t().teamSchedule.hours.saving
                                            : t().teamSchedule.hours.save}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Show>

                <Show when={activeTab() === "bloqueios"}>
                    <div class="flex flex-col gap-4">
                        <div>
                            <Button
                                variant="primary"
                                onClick={() => setIsCreateBlockOpen(true)}
                            >
                                {t().teamSchedule.blocks.add}
                            </Button>
                        </div>

                        <div class="mt-2 flex flex-col gap-3">
                            <Show
                                when={(exceptions() ?? []).length > 0}
                                fallback={
                                    <p class="text-sm text-muted-foreground">
                                        {t().teamSchedule.blocks.empty}
                                    </p>
                                }
                            >
                                <For each={exceptions() ?? []}>
                                    {(item) => (
                                        <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                            <div class="flex flex-wrap items-center gap-4">
                                                <div class="flex items-center gap-1.5 rounded-full border border-error/20 bg-error/10 px-3 py-1 text-xs font-bold text-error">
                                                    {t().teamSchedule.blocks.tag}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-foreground">
                                                        {item.reason}
                                                    </p>
                                                    <p class="text-sm text-muted-foreground">
                                                        {formatDate(item.date)} •{" "}
                                                        {formatTime(item.startTime)} -{" "}
                                                        {formatTime(item.endTime)}
                                                        {item.professional
                                                            ? ` • ${
                                                                  item.professional.user
                                                                      ?.name ||
                                                                  `${t().teamSchedule.defaultProfessional} ${item.professional.id.substring(0, 4)}`
                                                              }`
                                                            : ` • ${t().teamSchedule.blocks.wholeBusiness}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <IconButton
                                                class="text-error hover:bg-error/10"
                                                aria-label={t().common.delete}
                                                onClick={() =>
                                                    setConfirmDeleteBlockId(item.id)
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                >
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </IconButton>
                                        </div>
                                    )}
                                </For>
                            </Show>
                        </div>
                    </div>
                </Show>
            </Suspense>

            <CustomizeViewDrawer
                isOpen={isCustomizeOpen()}
                onClose={() => setIsCustomizeOpen(false)}
                config={viewConfig()}
                availableModes={[
                    { value: "grid", label: t().customization.modes.grid },
                    { value: "table", label: t().customization.modes.table },
                ]}
                availableColumns={availableColumns()}
                widgetLabels={widgetLabels()}
                onChangeConfig={setViewConfig}
                onSave={handleSaveCustomization}
                onReset={handleResetCustomization}
                onCreatePreset={handleCreatePreset}
                onApplyPreset={applyPresetValues}
                onDeletePreset={handleDeletePreset}
            />

            {/* --- DETALHES DO AGENDAMENTO --- */}
            <Modal
                isOpen={isModalOpen()}
                onClose={() => setIsModalOpen(false)}
                title={t().teamSchedule.details.title}
            >
                <Show when={selectedAppointment()}>
                    {(appt) => (
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div class="flex items-center gap-3">
                                    <Avatar
                                        size="lg"
                                        fallbackInitials={(
                                            appt().client?.name ||
                                            appt().client?.user?.name ||
                                            "C"
                                        )
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    />
                                    <div>
                                        <h4 class="text-lg font-bold text-foreground">
                                            {appt().client?.name ||
                                                appt().client?.user?.name ||
                                                t().teamSchedule.defaultClient}
                                        </h4>
                                        <span class="font-mono text-xs text-muted-foreground">
                                            #{appt().id.substring(0, 8)}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant={statusBadgeVariant(appt().status)}>
                                    {(
                                        t().appointments.status as Record<string, string>
                                    )[appt().status] ?? appt().status}
                                </Badge>
                            </div>

                            <div class="flex flex-col gap-2 rounded-md border border-border bg-muted p-4 text-foreground">
                                <p class="text-sm">
                                    <strong>{t().teamSchedule.details.service}</strong>{" "}
                                    {localizeDomain.serviceName(appt().service?.name)}
                                    <Show when={appt().service?.price != null}>
                                        {" · "}
                                        {formatMoney(Number(appt().service?.price ?? 0))}
                                    </Show>
                                </p>
                                <p class="text-sm">
                                    <strong>{t().teamSchedule.details.dateTime}</strong>{" "}
                                    {formatDate(appt().date)} —{" "}
                                    {formatTime(appt().startTime)} (
                                    {appt().service?.durationMinutes || 60}{" "}
                                    {t().common.minutesShort})
                                </p>
                                <p class="text-sm">
                                    <strong>
                                        {t().teamSchedule.details.professional}
                                    </strong>{" "}
                                    {profNameFor(appt())}
                                </p>
                                <p class="text-sm">
                                    <strong>
                                        {t().teamSchedule.details.rescheduleCount}
                                    </strong>{" "}
                                    {appt().rescheduleCount ?? 0} / {MAX_RESCHEDULES}
                                </p>
                                <ClientReputationBadge clientId={appt().client?.id} />
                            </div>

                            <Show when={appt().proposedDate}>
                                <div class="rounded border border-warning/30 bg-warning/10 p-3 text-sm">
                                    {t().teamSchedule.details.pendingProposal(
                                        formatDate(appt().proposedDate || ""),
                                        formatTime(appt().proposedStartTime || ""),
                                    )}
                                </div>
                            </Show>

                            <Show when={remainingReschedules(appt()) === 0}>
                                <div class="rounded border border-error/20 bg-error/10 p-3 text-sm text-error">
                                    {t().teamSchedule.details.limitReached(MAX_RESCHEDULES)}
                                </div>
                            </Show>

                            <Show when={!showCancelJustified()}>
                                <div class="mt-2 flex flex-col gap-2">
                                    <Show when={appt().status === "CONFIRMED"}>
                                        <Button
                                            variant="primary"
                                            class="w-full"
                                            onClick={() =>
                                                handleUpdateStatus(appt().id, "COMPLETED")
                                            }
                                        >
                                            {t().teamSchedule.completeServiceBtn}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            class="w-full border-error/30 text-error hover:bg-error/10"
                                            onClick={() =>
                                                setConfirmNoShowModal({
                                                    type: "MARK",
                                                    id: appt().id,
                                                })
                                            }
                                        >
                                            {t().teamSchedule.details.registerNoShow}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            class="w-full"
                                            onClick={() => setShowCancelJustified(true)}
                                        >
                                            {t().teamSchedule.details.cancelWithReason}
                                        </Button>
                                    </Show>

                                    <Show when={appt().status === "NO_SHOW"}>
                                        <Show
                                            when={
                                                appt().cancelledByRole === "manager_noshow"
                                            }
                                        >
                                            <div class="mb-1 text-center text-xs text-muted-foreground">
                                                {t().teamSchedule.details.penaltyApplied}
                                            </div>
                                            <Button
                                                variant="secondary"
                                                class="w-full"
                                                onClick={() =>
                                                    setConfirmNoShowModal({
                                                        type: "REVERT",
                                                        id: appt().id,
                                                    })
                                                }
                                            >
                                                {t().teamSchedule.details.revertNoShow}
                                            </Button>
                                        </Show>
                                        <Show
                                            when={
                                                appt().cancelledByRole !== "manager_noshow"
                                            }
                                        >
                                            <div class="mb-1 text-center text-xs text-muted-foreground">
                                                {t().teamSchedule.details.autoReleased}
                                            </div>
                                            <Button
                                                variant="outline"
                                                class="mb-1 w-full border-error/30 text-error hover:bg-error/10"
                                                onClick={() =>
                                                    setConfirmNoShowModal({
                                                        type: "MARK",
                                                        id: appt().id,
                                                    })
                                                }
                                            >
                                                {t().teamSchedule.details.registerNoShow}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                class="w-full"
                                                onClick={() =>
                                                    setConfirmNoShowModal({
                                                        type: "PRESENCE",
                                                        id: appt().id,
                                                    })
                                                }
                                            >
                                                {t().teamSchedule.details.registerPresence}
                                            </Button>
                                        </Show>
                                    </Show>

                                    <div class="flex flex-col gap-2 sm:flex-row">
                                        <Show when={canPropose(appt())}>
                                            <Button
                                                variant="primary"
                                                class="flex-1 justify-center text-center"
                                                onClick={() => openProposal(appt())}
                                            >
                                                {t().teamSchedule.details.proposeNewTime}
                                            </Button>
                                        </Show>
                                        <Button
                                            variant="outline"
                                            class="flex-1 justify-center text-center"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            {t().common.close}
                                        </Button>
                                    </div>
                                </div>
                            </Show>

                            <Show when={showCancelJustified()}>
                                <div class="mt-2 flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                                    <h5 class="text-sm font-bold">
                                        {t().teamSchedule.justifiedCancel.title}
                                    </h5>
                                    <Input
                                        labelText={
                                            t().teamSchedule.justifiedCancel.reasonLabel
                                        }
                                        placeholder={
                                            t().teamSchedule.justifiedCancel
                                                .reasonPlaceholder
                                        }
                                        value={cancelReason()}
                                        onInput={(e) =>
                                            setCancelReason(e.currentTarget.value)
                                        }
                                    />

                                    <label class="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={affectsReputation()}
                                            onChange={(e) =>
                                                setAffectsReputation(
                                                    e.currentTarget.checked,
                                                )
                                            }
                                            class="h-4 w-4 rounded border-input bg-background accent-primary"
                                        />
                                        {t().teamSchedule.justifiedCancel.affectsReputation}
                                    </label>

                                    <div class="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            class="flex-1"
                                            onClick={() => setShowCancelJustified(false)}
                                        >
                                            {t().common.back}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            class="flex-1"
                                            onClick={() =>
                                                submitCancelJustified(appt().id)
                                            }
                                        >
                                            {t().teamSchedule.justifiedCancel.confirm}
                                        </Button>
                                    </div>
                                </div>
                            </Show>
                        </div>
                    )}
                </Show>
            </Modal>

            {/* --- PROPOSTA DE NOVO HORÁRIO --- */}
            <Show when={proposalTarget()}>
                {(target) => (
                    <BookingModal
                        isOpen={true}
                        mode="propose"
                        appointmentId={target().id}
                        initialDate={target().date}
                        professionalId={target().professional?.id || target().professionalId}
                        businessId={target().business?.id || getActiveBizId() || ""}
                        serviceId={target().service?.id || target().serviceId}
                        serviceName={
                            target().service?.name || t().teamSchedule.defaultService
                        }
                        durationMinutes={target().service?.durationMinutes || 60}
                        cleanupMinutes={target().service?.cleanupMinutes || 0}
                        onSuccess={refreshSchedules}
                        onClose={() => setProposalTarget(null)}
                    />
                )}
            </Show>

            {/* --- NOVO BLOQUEIO --- */}
            <Modal
                isOpen={isCreateBlockOpen()}
                onClose={() => {
                    setIsCreateBlockOpen(false);
                    setPendingConflictData(null);
                    setCreateError("");
                }}
                title={t().teamSchedule.blocks.modalTitle}
            >
                <div class="flex flex-col gap-4">
                    <Show when={createError()}>
                        <div class="rounded bg-error/10 p-3 text-sm font-medium text-error">
                            {createError()}
                        </div>
                    </Show>

                    <Show when={pendingConflictData()}>
                        <div class="flex flex-col gap-2 rounded border border-warning/30 bg-warning/20 p-4 text-sm">
                            <p class="font-bold text-warning-foreground">
                                {t().teamSchedule.blocks.pendingConflictTitle}
                            </p>
                            <p>{pendingConflictData()?.message}</p>
                            <p>{t().teamSchedule.blocks.pendingConflictQuestion}</p>
                            <div class="mt-2 flex flex-wrap gap-2">
                                <Button
                                    variant="primary"
                                    onClick={() => handleSaveBlock(true)}
                                >
                                    {t().teamSchedule.blocks.forceBlock}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setPendingConflictData(null)}
                                >
                                    {t().teamSchedule.blocks.dontForce}
                                </Button>
                            </div>
                        </div>
                    </Show>

                    <Show when={!pendingConflictData()}>
                        <Input
                            labelText={t().teamSchedule.blocks.date}
                            type="date"
                            value={blockDate()}
                            onInput={(e) => setBlockDate(e.currentTarget.value)}
                        />
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                labelText={t().teamSchedule.blocks.start}
                                type="time"
                                value={blockStart()}
                                onInput={(e) => setBlockStart(e.currentTarget.value)}
                            />
                            <Input
                                labelText={t().teamSchedule.blocks.end}
                                type="time"
                                value={blockEnd()}
                                onInput={(e) => setBlockEnd(e.currentTarget.value)}
                            />
                        </div>
                        <Input
                            labelText={t().teamSchedule.blocks.reason}
                            placeholder={t().teamSchedule.blocks.reasonPlaceholder}
                            value={blockReason()}
                            onInput={(e) => setBlockReason(e.currentTarget.value)}
                        />

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-bold uppercase text-muted-foreground">
                                {t().teamSchedule.blocks.affects}
                            </label>
                            <select
                                class="h-10 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary"
                                value={blockProfId()}
                                onChange={(e) => setBlockProfId(e.currentTarget.value)}
                            >
                                <option value="">
                                    {t().teamSchedule.blocks.wholeBusiness}
                                </option>
                                <For each={professionals() || []}>
                                    {(p) => <option value={p.id}>{p.name}</option>}
                                </For>
                            </select>
                        </div>

                        <div class="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateBlockOpen(false)}
                            >
                                {t().common.cancel}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleSaveBlock(false)}
                            >
                                {t().teamSchedule.blocks.save}
                            </Button>
                        </div>
                    </Show>
                </div>
            </Modal>

            <Modal
                isOpen={!!confirmNoShowModal()}
                onClose={() => setConfirmNoShowModal(null)}
                title={
                    confirmNoShowModal()
                        ? noShowCopy(confirmNoShowModal()!.type).title
                        : ""
                }
            >
                <Show when={confirmNoShowModal()}>
                    {(modalData) => (
                        <div class="flex flex-col gap-4">
                            <p class="text-sm text-muted-foreground">
                                {noShowCopy(modalData().type).message}
                            </p>
                            <div class="flex justify-end gap-2 border-t border-border pt-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setConfirmNoShowModal(null)}
                                >
                                    {t().common.cancel}
                                </Button>
                                <Button
                                    variant={
                                        modalData().type === "MARK" ? "danger" : "primary"
                                    }
                                    onClick={confirmNoShowAction}
                                >
                                    {noShowCopy(modalData().type).confirm}
                                </Button>
                            </div>
                        </div>
                    )}
                </Show>
            </Modal>

            <Modal
                isOpen={!!confirmRefuseId()}
                onClose={() => setConfirmRefuseId(null)}
                title={t().teamSchedule.pending.refuseTitle}
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">
                        {t().teamSchedule.pending.refuseMessage}
                    </p>
                    <div class="flex justify-end gap-2 border-t border-border pt-3">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmRefuseId(null)}
                        >
                            {t().common.back}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                confirmRefuseId() &&
                                executeRefuseAppointment(confirmRefuseId()!)
                            }
                        >
                            {t().teamSchedule.pending.refuseConfirm}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!confirmDeleteBlockId()}
                onClose={() => setConfirmDeleteBlockId(null)}
                title={t().teamSchedule.blocks.deleteTitle}
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">
                        {t().teamSchedule.blocks.deleteMessage}
                    </p>
                    <div class="flex justify-end gap-2 border-t border-border pt-3">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDeleteBlockId(null)}
                        >
                            {t().common.back}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                confirmDeleteBlockId() &&
                                executeDeleteException(confirmDeleteBlockId()!)
                            }
                        >
                            {t().teamSchedule.blocks.deleteConfirm}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}