import { createSignal, createResource, Show, For } from "solid-js";
import { Card } from "../components/Widgets/Card";
import { Button } from "../components/Widgets/Button";
import { BookingModal } from "../components/Widgets/BookingModal";
import { CalendarIcon, ClockIcon, CheckCircleIcon, XIcon, BriefcaseIcon } from "../components/Icons/Icons";
import { appointmentsService, MAX_RESCHEDULES } from "../services/appointments.service";
import { t, getClientId } from "../store/appState";
import { toast } from "../store/toastStore";
import { ApiError } from "../services/api";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";

const formatDate = (isoDate: string) => isoDate.split("-").reverse().join("/");

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    CONFIRMED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    NO_SHOW: "bg-red-900/10 text-red-600 border-red-600/20 font-bold",
};

const MANAGER_NO_SHOW_ROLES = ["manager", "manager_noshow"];

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
                        <div class={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                            r().noShowCount >= 3
                                ? "bg-error/10 text-error border-error/20 font-bold"
                                : "bg-warning/10 text-warning-foreground border-warning/20"
                        }`}>
                            {t().appointments.reputation.noShow(r().noShowCount)}
                            {r().noShowCount >= 3 ? t().appointments.reputation.noShowWarning : ""}
                        </div>
                    </Show>
                    <Show when={r().successStreak > 0}>
                        <div class="flex items-center gap-2 bg-success/10 text-success border border-success/20 px-4 py-2 rounded-lg text-sm font-semibold">
                            {t().appointments.reputation.streak(r().successStreak)}
                        </div>
                    </Show>
                </div>
            )}
        </Show>
    );
};

export default function Agendamentos() {
    const [filter, setFilter] = createSignal<StatusFilter>("ALL");
    const [appointments, { refetch }] = createResource(appointmentsService.getMyAppointments);

    const [canceling, setCanceling] = createSignal<string | null>(null);
    const [confirmCancelId, setConfirmCancelId] = createSignal<string | null>(null);
    const [cancelErrorMessage, setCancelErrorMessage] = createSignal<string | null>(null);
    const [respondingId, setRespondingId] = createSignal<string | null>(null);
    const [reschedulingApp, setReschedulingApp] = createSignal<any>(null);

    const executeCancel = async (id: string) => {
        setCanceling(id);
        try {
            await appointmentsService.cancel(id);
            setConfirmCancelId(null);
            refetch();
            toast.success(t().appointments.toasts.cancelled);
        } catch (err: any) {
            // O backend explica o motivo (política de antecedência, no-show,
            // status inválido), então mostramos a mensagem num modal em vez
            // de um toast que some.
            setConfirmCancelId(null);
            setCancelErrorMessage(err.message || t().appointments.toasts.cancelError);
        } finally {
            setCanceling(null);
        }
    };

    const respondToProposal = async (id: string, accept: boolean) => {
        setRespondingId(id);
        try {
            await appointmentsService.respondToProposal(id, accept);
            refetch();
            toast.success(
                accept
                    ? t().appointments.toasts.proposalAccepted
                    : t().appointments.toasts.proposalDeclined,
            );
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 409) {
                toast.error(t().appointments.toasts.proposalConflict);
                refetch();
            } else {
                toast.error(err.message || t().appointments.toasts.respondError);
            }
        } finally {
            setRespondingId(null);
        }
    };

    const filteredAppointments = () => {
        const list = appointments() || [];
        if (filter() === "ALL") return list;
        return list.filter((app: any) => app.status === filter());
    };

    const remainingReschedules = (app: any) =>
        Math.max(0, MAX_RESCHEDULES - (app.rescheduleCount ?? 0));

    const canReschedule = (app: any) =>
        (app.status === "PENDING" || app.status === "CONFIRMED") && !app.proposedDate;

    const canCancel = (app: any) =>
        app.status === "PENDING" || app.status === "CONFIRMED";

    const isManagerNoShow = (app: any) =>
        app.status === "NO_SHOW" && MANAGER_NO_SHOW_ROLES.includes(app.cancelledByRole);

    const statusText = (app: any) =>
        isManagerNoShow(app)
            ? t().appointments.noShowByManager
            : (t().appointments.status as Record<string, string>)[app.status] ?? app.status;

    const statusColor = (app: any) =>
        STATUS_COLORS[app.status] ?? "bg-secondary text-muted-foreground";

    return (
        <div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 pb-20 md:py-12 animate-in fade-in duration-300">
            <header class="flex flex-col gap-2">
                <h1 class="text-3xl font-bold text-foreground">{t().appointments.title}</h1>
                <p class="text-muted-foreground">{t().appointments.subtitle}</p>
            </header>

            <MyReputation />

            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button variant={filter() === "ALL" ? "primary" : "outline"} onClick={() => setFilter("ALL")} class="rounded-full">
                    {t().appointments.filters.all}
                </Button>
                <Button variant={filter() === "PENDING" ? "primary" : "outline"} onClick={() => setFilter("PENDING")} class="rounded-full">
                    {t().appointments.filters.pending}
                </Button>
                <Button variant={filter() === "CONFIRMED" ? "primary" : "outline"} onClick={() => setFilter("CONFIRMED")} class="rounded-full">
                    {t().appointments.filters.confirmed}
                </Button>
                <Button variant={filter() === "CANCELLED" ? "primary" : "outline"} onClick={() => setFilter("CANCELLED")} class="rounded-full">
                    {t().appointments.filters.cancelled}
                </Button>
            </div>

            <Show when={!appointments.loading} fallback={
                <div class="p-20 text-center text-muted-foreground animate-pulse">{t().appointments.loading}</div>
            }>
                <div class="flex flex-col gap-4">
                    <Show when={filteredAppointments().length > 0} fallback={
                        <div class="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                            <p class="text-muted-foreground">{t().appointments.empty}</p>
                        </div>
                    }>
                        <For each={filteredAppointments()}>
                            {(app: any) => (
                                <Card class="p-6 flex flex-col gap-5 border-border group hover:border-primary/40 transition-colors">
                                    <div class="flex flex-col md:flex-row justify-between gap-6">
                                        {/* --- INFORMAÇÕES --- */}
                                        <div class="flex flex-col gap-4">
                                            <div class="flex items-center gap-3">
                                                <div class={`px-3 py-1 rounded-full border text-xs font-bold ${statusColor(app)}`}>
                                                    {statusText(app)}
                                                </div>
                                                <span class="text-sm text-muted-foreground">
                                                    {t().appointments.idPrefix} #{app.id.substring(0, 8)}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 class="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {app.service?.name || t().appointments.fallback.service}
                                                </h3>
                                                <p class="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                                    <BriefcaseIcon size={14}/>
                                                    {app.professional?.user?.name || t().appointments.fallback.professional}
                                                    {" - "}
                                                    {app.business?.tradeName || t().appointments.fallback.business}
                                                </p>
                                            </div>

                                            <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground">
                                                <div class="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                                                    <CalendarIcon size={16} class="text-muted-foreground"/>
                                                    {formatDate(app.date)}
                                                </div>
                                                <div class="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                                                    <ClockIcon size={16} class="text-muted-foreground"/>
                                                    {app.startTime} - {app.endTime}
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- AÇÕES --- */}
                                        <div class="flex flex-row md:flex-col items-center justify-end md:justify-center gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 md:min-w-44">
                                            <Show when={app.status === "CONFIRMED"}>
                                                <div class="text-center w-full bg-emerald-500/10 text-emerald-600 py-2 rounded-lg border border-emerald-500/20 font-medium text-sm flex items-center justify-center gap-2">
                                                    <CheckCircleIcon size={16}/> {t().appointments.reserved}
                                                </div>
                                            </Show>

                                            <Show when={app.status === "COMPLETED"}>
                                                <div class="text-center w-full bg-blue-500/10 text-blue-600 py-2 rounded-lg border border-blue-500/20 font-medium text-sm flex items-center justify-center gap-2">
                                                    <CheckCircleIcon size={16}/> {t().appointments.completed}
                                                </div>
                                            </Show>

                                            <Show when={canReschedule(app)}>
                                                <div class="flex flex-col items-center gap-1 w-full">
                                                    <Button
                                                        variant="outline"
                                                        class="w-full text-foreground"
                                                        disabled={remainingReschedules(app) === 0}
                                                        title={
                                                            remainingReschedules(app) === 0
                                                                ? t().appointments.limitReachedTitle(MAX_RESCHEDULES)
                                                                : undefined
                                                        }
                                                        onClick={() => setReschedulingApp(app)}
                                                    >
                                                        <CalendarIcon size={16} class="mr-2"/>
                                                        {t().appointments.reschedule}
                                                    </Button>
                                                    <span class="text-xs text-muted-foreground text-center">
                                                        <Show
                                                            when={remainingReschedules(app) > 0}
                                                            fallback={t().appointments.limitReachedShort(MAX_RESCHEDULES)}
                                                        >
                                                            {t().appointments.remaining(remainingReschedules(app), MAX_RESCHEDULES)}
                                                        </Show>
                                                    </span>
                                                </div>
                                            </Show>

                                            <Show when={canCancel(app)}>
                                                <Button
                                                    variant="outline"
                                                    class="w-full text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                                    onClick={() => setConfirmCancelId(app.id)}
                                                >
                                                    <XIcon size={16} class="mr-2"/>
                                                    {t().common.cancel}
                                                </Button>
                                            </Show>
                                        </div>
                                    </div>

                                    {/* --- PROPOSTA DO GESTOR --- */}
                                    <Show when={app.proposedDate}>
                                        <div class="flex flex-col gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <p class="text-sm text-foreground">
                                                {t().appointments.proposal.text(formatDate(app.proposedDate), app.proposedStartTime)}
                                            </p>
                                            <span class="text-xs text-muted-foreground">
                                                {t().appointments.proposal.hint(MAX_RESCHEDULES, remainingReschedules(app))}
                                            </span>
                                            <div class="flex gap-2">
                                                <Button
                                                    variant="primary"
                                                    disabled={respondingId() === app.id}
                                                    onClick={() => respondToProposal(app.id, true)}
                                                >
                                                    {respondingId() === app.id
                                                        ? t().common.wait
                                                        : t().appointments.proposal.accept}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    disabled={respondingId() === app.id}
                                                    onClick={() => respondToProposal(app.id, false)}
                                                >
                                                    {t().appointments.proposal.decline}
                                                </Button>
                                            </div>
                                        </div>
                                    </Show>
                                </Card>
                            )}
                        </For>
                    </Show>
                </div>
            </Show>

            {/* --- MODAL DE REAGENDAMENTO --- */}
            <Show when={reschedulingApp()}>
                <BookingModal
                    isOpen={!!reschedulingApp()}
                    mode="reschedule"
                    appointmentId={reschedulingApp().id}
                    initialDate={reschedulingApp().date}
                    professionalId={reschedulingApp().professional?.id}
                    businessId={reschedulingApp().business?.id}
                    serviceId={reschedulingApp().service?.id}
                    serviceName={reschedulingApp().service?.name || t().appointments.fallback.service}
                    durationMinutes={reschedulingApp().service?.durationMinutes || 60}
                    price={reschedulingApp().service?.price}
                    onSuccess={refetch}
                    onClose={() => setReschedulingApp(null)}
                />
            </Show>

            {/* --- MODAL DE CANCELAMENTO --- */}
            <Show when={confirmCancelId()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                        <div class="p-6 flex flex-col items-center text-center gap-4">
                            <div class="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <XIcon size={32}/>
                            </div>
                            <h2 class="text-xl font-bold text-foreground">{t().appointments.cancelModal.title}</h2>
                            <p class="text-muted-foreground text-sm">{t().appointments.cancelModal.message}</p>
                        </div>
                        <div class="flex border-t border-border bg-muted/30">
                            <button
                                class="flex-1 py-4 font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border-r border-border"
                                onClick={() => setConfirmCancelId(null)}
                                disabled={!!canceling()}
                            >
                                {t().common.back}
                            </button>
                            <button
                                class="flex-1 py-4 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                onClick={() => executeCancel(confirmCancelId()!)}
                                disabled={!!canceling()}
                            >
                                {canceling() ? t().common.wait : t().appointments.cancelModal.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>

            {/* --- AVISO DE CANCELAMENTO RECUSADO --- */}
            <Show when={cancelErrorMessage()}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div class="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
                        <div class="p-6 flex flex-col items-center text-center gap-4">
                            <div class="size-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-2">
                                <XIcon size={32}/>
                            </div>
                            <h2 class="text-xl font-bold text-foreground">{t().appointments.cancelError.title}</h2>
                            <p class="text-muted-foreground text-sm">{cancelErrorMessage()}</p>
                        </div>
                        <div class="flex border-t border-border bg-muted/30">
                            <button
                                class="flex-1 py-4 font-bold text-primary hover:bg-primary/10 transition-colors"
                                onClick={() => setCancelErrorMessage(null)}
                            >
                                {t().appointments.cancelError.ok}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
}