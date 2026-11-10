import { createResource, createSignal, For, Show } from "solid-js";
import {
    BriefcaseIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    XIcon,
} from "../components/Icons/Icons";
import { BookingModal } from "../components/Widgets/BookingModal";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { Modal } from "../components/Widgets/Modal";
import { ReviewWidget } from "../components/Widgets/ReviewWidget";
import type { Appointment } from "../core/domain/entities/models";
import { AppointmentPolicy } from "../core/domain/policies/AppointmentPolicy";
import {
    formatDate,
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
import { getClientId } from "../store/appState";
import { toast } from "../store/toastStore";

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning-foreground border-warning/30",
    CONFIRMED: "bg-success/15 text-success border-success/30",
    CANCELLED: "bg-error/15 text-error border-error/30",
    COMPLETED: "bg-primary/15 text-primary border-primary/30",
    NO_SHOW: "bg-error/20 text-error border-error/40 font-bold",
};

const MyReputation = () => {
    const [rep] = createResource(getClientId, async (id) => {
        if (!id) return null;
        try {
            return await appointmentsService.getClientReputation(id);
        } catch {
            return null;
        }
    });

    return (
        <Show when={rep()}>
            {(r) => (
                <div class="flex flex-wrap gap-2">
                    <Show when={r().noShowCount > 0}>
                        <div
                            class={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${
                                r().noShowCount >= 3
                                    ? "border-error/30 bg-error/10 font-bold text-error"
                                    : "border-warning/30 bg-warning/10 text-warning-foreground"
                            }`}
                        >
                            {t().appointments.reputation.noShow(r().noShowCount)}
                            {r().noShowCount >= 3
                                ? t().appointments.reputation.noShowWarning
                                : ""}
                        </div>
                    </Show>
                    <Show when={r().successStreak > 0}>
                        <div class="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm font-semibold text-success">
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
    const [appointments, { refetch }] = createResource(
        appointmentsService.getMyAppointments,
    );

    const [canceling, setCanceling] = createSignal<string | null>(null);
    const [confirmCancelId, setConfirmCancelId] = createSignal<string | null>(
        null,
    );
    const [cancelErrorMessage, setCancelErrorMessage] = createSignal<
        string | null
    >(null);
    const [respondingId, setRespondingId] = createSignal<string | null>(null);
    const [reschedulingApp, setReschedulingApp] =
        createSignal<Appointment | null>(null);

    const executeCancel = async (id: string) => {
        setCanceling(id);
        try {
            await appointmentsService.cancel(id);
            setConfirmCancelId(null);
            refetch();
            toast.success(t().appointments.toasts.cancelled);
        } catch (err: any) {
            setConfirmCancelId(null);
            setCancelErrorMessage(
                localizeDomain.apiError(
                    err?.message,
                    t().appointments.toasts.cancelError,
                ),
            );
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
                toast.error(
                    localizeDomain.apiError(
                        err?.message,
                        t().appointments.toasts.respondError,
                    ),
                );
            }
        } finally {
            setRespondingId(null);
        }
    };

    const filteredAppointments = () => {
        const list = appointments() || [];
        if (filter() === "ALL") return list;
        return list.filter((app) => {
            if (filter() === "CANCELLED") {
                return app.status === "CANCELLED" || app.status === "NO_SHOW";
            }
            return app.status === filter();
        });
    };

    const remainingReschedules = (app: Appointment) =>
        AppointmentPolicy.remainingReschedules(app);

    const canReschedule = (app: Appointment) =>
        (app.status === "PENDING" || app.status === "CONFIRMED") &&
        !app.proposedDate;

    const canCancel = (app: Appointment) => AppointmentPolicy.canCancel(app);

    const statusText = (app: Appointment) =>
        AppointmentPolicy.isManagerNoShow(app)
            ? t().appointments.noShowByManager
            : (t().appointments.status as Record<string, string>)[app.status] ??
              app.status;

    const statusColor = (app: Appointment) =>
        STATUS_COLORS[app.status] ?? "bg-secondary text-muted-foreground";

    return (
        <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 pb-20 sm:py-8 md:gap-8 md:py-10">
            <header class="flex flex-col gap-2">
                <h1 class="text-2xl font-bold text-foreground sm:text-3xl">
                    {t().appointments.title}
                </h1>
                <p class="text-muted-foreground">{t().appointments.subtitle}</p>
            </header>

            <MyReputation />

            <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <Button
                    variant={filter() === "ALL" ? "primary" : "outline"}
                    onClick={() => setFilter("ALL")}
                    class="shrink-0 rounded-full"
                >
                    {t().appointments.filters.all}
                </Button>
                <Button
                    variant={filter() === "PENDING" ? "primary" : "outline"}
                    onClick={() => setFilter("PENDING")}
                    class="shrink-0 rounded-full"
                >
                    {t().appointments.filters.pending}
                </Button>
                <Button
                    variant={filter() === "CONFIRMED" ? "primary" : "outline"}
                    onClick={() => setFilter("CONFIRMED")}
                    class="shrink-0 rounded-full"
                >
                    {t().appointments.filters.confirmed}
                </Button>
                <Button
                    variant={filter() === "COMPLETED" ? "primary" : "outline"}
                    onClick={() => setFilter("COMPLETED")}
                    class="shrink-0 rounded-full"
                >
                    {t().appointments.filters.completed}
                </Button>
                <Button
                    variant={filter() === "CANCELLED" ? "primary" : "outline"}
                    onClick={() => setFilter("CANCELLED")}
                    class="shrink-0 rounded-full"
                >
                    {t().appointments.filters.cancelled}
                </Button>
            </div>

            <Show
                when={!appointments.loading}
                fallback={
                    <div class="animate-pulse p-16 text-center text-muted-foreground">
                        {t().appointments.loading}
                    </div>
                }
            >
                <div class="flex flex-col gap-4">
                    <Show
                        when={filteredAppointments().length > 0}
                        fallback={
                            <div class="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
                                <p class="text-muted-foreground">
                                    {t().appointments.empty}
                                </p>
                            </div>
                        }
                    >
                        <For each={filteredAppointments()}>
                            {(app) => (
                                <Card class="group flex flex-col gap-5 border-border p-5 transition-colors hover:border-primary/40 sm:p-6">
                                    <div class="flex flex-col justify-between gap-5 md:flex-row">
                                        <div class="flex flex-col gap-3.5">
                                            <div class="flex flex-wrap items-center gap-2.5">
                                                <div
                                                    class={`rounded-full border px-3 py-1 text-xs font-bold ${statusColor(app)}`}
                                                >
                                                    {statusText(app)}
                                                </div>
                                                <span class="font-mono text-xs text-muted-foreground">
                                                    {t().appointments.idPrefix} #
                                                    {app.id.substring(0, 8)}
                                                </span>
                                                <Show when={app.service?.price != null}>
                                                    <span
                                                        class="text-xs font-bold text-foreground"
                                                        title={
                                                            formatMoneyHint(
                                                                Number(
                                                                    app.service?.price ??
                                                                        0,
                                                                ),
                                                            ) ?? undefined
                                                        }
                                                    >
                                                        {formatMoney(
                                                            Number(
                                                                app.service?.price ?? 0,
                                                            ),
                                                        )}
                                                    </span>
                                                </Show>
                                            </div>

                                            <div>
                                                <h3 class="text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                                                    {localizeDomain.serviceName(
                                                        app.service?.name ||
                                                            t().appointments.fallback
                                                                .service,
                                                    )}
                                                </h3>
                                                <p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                    <BriefcaseIcon size={14} />
                                                    <span>
                                                        {app.professional?.user?.name ||
                                                            t().appointments.fallback
                                                                .professional}
                                                    </span>
                                                    <span>·</span>
                                                    <span>
                                                        {app.business?.tradeName ||
                                                            t().appointments.fallback
                                                                .business}
                                                    </span>
                                                </p>
                                            </div>

                                            <div class="flex flex-wrap items-center gap-3 text-sm font-medium text-foreground">
                                                <div class="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5">
                                                    <CalendarIcon
                                                        size={16}
                                                        class="text-muted-foreground"
                                                    />
                                                    {formatDate(app.date)}
                                                </div>
                                                <div class="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5">
                                                    <ClockIcon
                                                        size={16}
                                                        class="text-muted-foreground"
                                                    />
                                                    {formatTime(app.startTime)} -{" "}
                                                    {formatTime(app.endTime)}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex flex-col items-stretch justify-center gap-2.5 border-t border-border pt-4 md:min-w-48 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                                            <Show when={app.status === "CONFIRMED"}>
                                                <div class="flex w-full items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 py-2 text-center text-sm font-semibold text-success">
                                                    <CheckCircleIcon size={16} />{" "}
                                                    {t().appointments.reserved}
                                                </div>
                                            </Show>

                                            <Show when={app.status === "COMPLETED"}>
                                                <div class="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 py-2 text-center text-sm font-semibold text-primary">
                                                    <CheckCircleIcon size={16} />{" "}
                                                    {t().appointments.completed}
                                                </div>
                                            </Show>

                                            <Show when={canReschedule(app)}>
                                                <div class="flex w-full flex-col items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        class="w-full justify-center text-foreground"
                                                        disabled={
                                                            remainingReschedules(app) ===
                                                            0
                                                        }
                                                        title={
                                                            remainingReschedules(app) ===
                                                            0
                                                                ? t().appointments.limitReachedTitle(
                                                                      MAX_RESCHEDULES,
                                                                  )
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            setReschedulingApp(app)
                                                        }
                                                    >
                                                        <CalendarIcon
                                                            size={16}
                                                            class="mr-2"
                                                        />
                                                        {t().appointments.reschedule}
                                                    </Button>
                                                    <span class="text-center text-xs text-muted-foreground">
                                                        <Show
                                                            when={
                                                                remainingReschedules(
                                                                    app,
                                                                ) > 0
                                                            }
                                                            fallback={t().appointments.limitReachedShort(
                                                                MAX_RESCHEDULES,
                                                            )}
                                                        >
                                                            {t().appointments.remaining(
                                                                remainingReschedules(
                                                                    app,
                                                                ),
                                                                MAX_RESCHEDULES,
                                                            )}
                                                        </Show>
                                                    </span>
                                                </div>
                                            </Show>

                                            <Show when={canCancel(app)}>
                                                <Button
                                                    variant="outline"
                                                    class="w-full justify-center border-error/30 text-error hover:bg-error/10"
                                                    onClick={() =>
                                                        setConfirmCancelId(app.id)
                                                    }
                                                >
                                                    <XIcon size={16} class="mr-2" />
                                                    {t().common.cancel}
                                                </Button>
                                            </Show>
                                        </div>
                                    </div>

                                    <Show when={app.status === "COMPLETED"}>
                                        <div class="border-t border-border pt-4">
                                            <ReviewWidget
                                                appointment={app}
                                                onReviewed={() => refetch()}
                                            />
                                        </div>
                                    </Show>

                                    <Show when={app.proposedDate}>
                                        <div class="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                                            <p class="text-sm text-foreground">
                                                {t().appointments.proposal.text(
                                                    formatDate(app.proposedDate || ""),
                                                    formatTime(
                                                        app.proposedStartTime || "",
                                                    ),
                                                )}
                                            </p>
                                            <span class="text-xs text-muted-foreground">
                                                {t().appointments.proposal.hint(
                                                    MAX_RESCHEDULES,
                                                    remainingReschedules(app),
                                                )}
                                            </span>
                                            <div class="flex flex-wrap gap-2">
                                                <Button
                                                    variant="primary"
                                                    disabled={respondingId() === app.id}
                                                    onClick={() =>
                                                        respondToProposal(app.id, true)
                                                    }
                                                >
                                                    {respondingId() === app.id
                                                        ? t().common.wait
                                                        : t().appointments.proposal
                                                              .accept}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    disabled={respondingId() === app.id}
                                                    onClick={() =>
                                                        respondToProposal(app.id, false)
                                                    }
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

            <Show when={reschedulingApp()}>
                {(target) => (
                    <BookingModal
                        isOpen={true}
                        mode="reschedule"
                        appointmentId={target().id}
                        initialDate={target().date}
                        professionalId={target().professional?.id}
                        businessId={target().business?.id || target().businessId || ""}
                        serviceId={target().service?.id || target().serviceId}
                        serviceName={
                            target().service?.name || t().appointments.fallback.service
                        }
                        durationMinutes={target().service?.durationMinutes || 60}
                        cleanupMinutes={target().service?.cleanupMinutes || 0}
                        price={target().service?.price}
                        onSuccess={refetch}
                        onClose={() => setReschedulingApp(null)}
                    />
                )}
            </Show>

            <Modal
                isOpen={!!confirmCancelId()}
                onClose={() => !canceling() && setConfirmCancelId(null)}
                title={t().appointments.cancelModal.title}
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">
                        {t().appointments.cancelModal.message}
                    </p>
                    <div class="flex justify-end gap-2 border-t border-border pt-3">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmCancelId(null)}
                            disabled={!!canceling()}
                        >
                            {t().common.back}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                confirmCancelId() && executeCancel(confirmCancelId()!)
                            }
                            disabled={!!canceling()}
                        >
                            {canceling()
                                ? t().common.wait
                                : t().appointments.cancelModal.confirm}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!cancelErrorMessage()}
                onClose={() => setCancelErrorMessage(null)}
                title={t().appointments.cancelError.title}
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">{cancelErrorMessage()}</p>
                    <div class="flex justify-end border-t border-border pt-3">
                        <Button
                            variant="primary"
                            onClick={() => setCancelErrorMessage(null)}
                        >
                            {t().appointments.cancelError.ok}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}