import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import type { BookingMode } from "../../core/application/booking/BookingStrategies";
import { container } from "../../core/container";
import type { ServiceCatalogItem, TeamMemberLink } from "../../core/domain/entities/models";
import {
    formatMoney,
    formatMoneyHint,
    formatTime,
    localizeDomain,
    t,
} from "../../core/i18n";
import { ApiError } from "../../services/api";
import {
    availabilityService,
    type Bound,
    type BoundsParams,
} from "../../services/availability.service";
import { CalendarIcon, CheckCircleIcon, ClockIcon, XIcon } from "../Icons/Icons";
import { Button } from "./Button";
import { Input } from "./Input";

const BOUNDS_POLLING_INTERVAL_MS = 20000;

export type { BookingMode };

export interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    mode?: BookingMode;
    appointmentId?: string;
    initialDate?: string;
    professionalId?: string;
    businessId: string;
    serviceId?: string;
    serviceName?: string;
    durationMinutes?: number;
    cleanupMinutes?: number;
    price?: number | string;
    catalogOptions?: ServiceCatalogItem[];
    teamOptions?: TeamMemberLink[];
}

export function BookingModal(props: BookingModalProps) {
    const [date, setDate] = createSignal("");
    const [selectedServiceId, setSelectedServiceId] = createSignal("");
    const [selectedProId, setSelectedProId] = createSignal("");
    const [bounds, setBounds] = createSignal<Bound[]>([]);
    const [loadingBounds, setLoadingBounds] = createSignal(false);
    const [boundsError, setBoundsError] = createSignal("");
    const [selectedTime, setSelectedTime] = createSignal("");
    const [loadingSubmit, setLoadingSubmit] = createSignal(false);
    const [feedback, setFeedback] = createSignal({ type: "", message: "" });
    const [isSuccess, setIsSuccess] = createSignal(false);

    const mode = (): BookingMode => props.mode ?? "create";
    const copy = () => t().booking.modes[mode()];
    const isBlocked = () => feedback().type === "blocked";

    const activeService = () => {
        if (props.catalogOptions && props.catalogOptions.length > 0) {
            return props.catalogOptions.find((s) => s.id === selectedServiceId());
        }
        return undefined;
    };

    const resolvedServiceId = () => activeService()?.id || props.serviceId || "";
    const resolvedServiceName = () =>
        localizeDomain.serviceName(activeService()?.name || props.serviceName || "");
    const resolvedDuration = () =>
        Number(activeService()?.durationMinutes ?? props.durationMinutes ?? 30);
    const resolvedCleanup = () =>
        Number(activeService()?.cleanupMinutes ?? props.cleanupMinutes ?? 0);
    const resolvedPrice = () => {
        const raw = activeService()?.price ?? props.price;
        return raw !== undefined && raw !== null ? Number(raw) : undefined;
    };
    const resolvedProId = () => {
        if (props.teamOptions) return selectedProId() || undefined;
        return props.professionalId || undefined;
    };

    const missingContext = () => !props.businessId || !resolvedServiceId();

    const generatedSlots = () =>
        availabilityService.generateAvailableSlots(
            bounds(),
            resolvedDuration(),
            resolvedDuration(),
            resolvedCleanup(),
        );

    const currentBoundsParams = (): BoundsParams => ({
        date: date(),
        professionalId: resolvedProId(),
        businessId: props.businessId,
        serviceId: resolvedServiceId(),
    });

    const fetchBounds = async () => {
        if (missingContext()) {
            setBounds([]);
            setBoundsError(t().booking.missingContext);
            return;
        }

        const params = currentBoundsParams();
        const cached = availabilityService.getCachedBounds(params);

        if (cached) {
            setBounds(cached);
        } else {
            setLoadingBounds(true);
        }

        try {
            const fresh = await availabilityService.refreshBounds(params);
            setBounds(fresh);
            setBoundsError("");
        } catch (err: any) {
            if (!cached) {
                setBounds([]);
                setBoundsError(
                    err instanceof ApiError
                        ? localizeDomain.apiError(err.message, t().booking.loadError)
                        : t().booking.loadError,
                );
            }
        } finally {
            setLoadingBounds(false);
        }
    };

    createEffect(() => {
        if (!props.isOpen) return;

        setDate(props.initialDate ?? "");
        setSelectedServiceId(
            props.serviceId || props.catalogOptions?.[0]?.id || "",
        );
        setSelectedProId(props.professionalId ?? "");
        setSelectedTime("");
        setBoundsError("");
        setFeedback({ type: "", message: "" });
        setIsSuccess(false);
    });

    createEffect(() => {
        const currentDate = date();
        const svcId = resolvedServiceId();
        void resolvedProId();
        if (!currentDate || !svcId || !props.isOpen) {
            setBounds([]);
            setSelectedTime("");
            return;
        }

        setSelectedTime("");
        void fetchBounds();
    });

    createEffect(() => {
        if (!date() || !resolvedServiceId() || !props.isOpen) return;

        const interval = setInterval(() => {
            void fetchBounds();
        }, BOUNDS_POLLING_INTERVAL_MS);
        onCleanup(() => clearInterval(interval));
    });

    const handleConfirm = async () => {
        if (!date() || !selectedTime()) {
            setFeedback({ type: "error", message: t().booking.selectDateTime });
            return;
        }

        setLoadingSubmit(true);
        setFeedback({ type: "", message: "" });

        try {
            await container.submitBookingUseCase.execute(mode(), {
                appointmentId: props.appointmentId,
                businessId: props.businessId,
                serviceId: resolvedServiceId(),
                professionalId: resolvedProId(),
                date: date(),
                startTime: selectedTime(),
            });

            container.availabilityRepo.invalidateBounds();
            setIsSuccess(true);
            setFeedback({
                type: "success",
                message: copy().success,
            });
            props.onSuccess?.();

            setTimeout(() => handleClose(), 2200);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 409) {
                setSelectedTime("");
                setFeedback({
                    type: "error",
                    message: localizeDomain.apiError(err.message, t().booking.slotTaken),
                });
                void fetchBounds();
            } else if (err instanceof ApiError && err.status === 422) {
                setFeedback({
                    type: "blocked",
                    message: localizeDomain.apiError(err.message, t().booking.limitReached),
                });
            } else {
                setFeedback({
                    type: "error",
                    message: localizeDomain.apiError(err?.message, t().common.genericError),
                });
            }
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleClose = () => {
        setDate("");
        setSelectedTime("");
        setBoundsError("");
        setFeedback({ type: "", message: "" });
        setIsSuccess(false);
        props.onClose();
    };

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-xs animate-in fade-in duration-200">
                <div class="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in zoom-in-95 duration-200">
                    <header class="flex items-center justify-between border-b border-border bg-muted/20 p-4">
                        <h2 class="text-lg font-bold text-foreground">{copy().title}</h2>
                        <button
                            type="button"
                            aria-label={t().common.close}
                            onClick={handleClose}
                            class="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <XIcon size={20} />
                        </button>
                    </header>

                    <div class="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                        <Show when={isSuccess()}>
                            <div class="flex flex-col items-center justify-center gap-4 py-8 text-center">
                                <div class="flex size-16 items-center justify-center rounded-full bg-success/20 text-success animate-bounce">
                                    <CheckCircleIcon size={32} />
                                </div>
                                <h3 class="text-xl font-bold text-foreground">
                                    {t().booking.successTitle}
                                </h3>
                                <p class="text-muted-foreground">{feedback().message}</p>
                            </div>
                        </Show>

                        <Show when={!isSuccess()}>
                            <Show
                                when={props.catalogOptions && props.catalogOptions.length > 0}
                                fallback={
                                    <div class="flex flex-col gap-1 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                        <span class="font-bold text-primary">
                                            {resolvedServiceName()}
                                        </span>
                                        <div class="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span class="flex items-center gap-1">
                                                <ClockIcon size={14} /> {resolvedDuration()}{" "}
                                                {t().common.minutesShort}
                                            </span>
                                            <Show when={resolvedPrice() !== undefined}>
                                                <span
                                                    class="font-bold text-foreground"
                                                    title={
                                                        formatMoneyHint(resolvedPrice()!) ??
                                                        undefined
                                                    }
                                                >
                                                    {formatMoney(resolvedPrice()!)}
                                                </span>
                                            </Show>
                                        </div>
                                    </div>
                                }
                            >
                                <div class="flex flex-col gap-2">
                                    <label class="text-xs font-semibold uppercase text-muted-foreground">
                                        {t().booking.selectServiceLabel}
                                    </label>
                                    <select
                                        value={selectedServiceId()}
                                        onChange={(e) =>
                                            setSelectedServiceId(e.currentTarget.value)
                                        }
                                        class="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                                    >
                                        <For each={props.catalogOptions}>
                                            {(svc) => (
                                                <option value={svc.id}>
                                                    {localizeDomain.serviceName(svc.name)} —{" "}
                                                    {formatMoney(svc.price)} (
                                                    {svc.durationMinutes}{" "}
                                                    {t().common.minutesShort})
                                                </option>
                                            )}
                                        </For>
                                    </select>
                                </div>
                            </Show>

                            <Show when={props.teamOptions && props.teamOptions.length > 0}>
                                <div class="flex flex-col gap-2">
                                    <label class="text-xs font-semibold uppercase text-muted-foreground">
                                        {t().booking.selectProfessionalLabel}
                                    </label>
                                    <select
                                        value={selectedProId()}
                                        onChange={(e) =>
                                            setSelectedProId(e.currentTarget.value)
                                        }
                                        class="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                                    >
                                        <option value="">
                                            {t().booking.anyProfessionalOption}
                                        </option>
                                        <For each={props.teamOptions}>
                                            {(member) => (
                                                <option value={member.professional?.id || member.professionalId || ""}>
                                                    {member.professional.user?.name ||
                                                        t().teamSchedule.defaultProfessional}
                                                </option>
                                            )}
                                        </For>
                                    </select>
                                </div>
                            </Show>

                            <Show when={mode() === "propose"}>
                                <p class="text-sm text-muted-foreground">
                                    {t().booking.proposeHint}
                                </p>
                            </Show>

                            <Show when={!isBlocked()}>
                                <div class="flex flex-col gap-2">
                                    <label class="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <CalendarIcon size={16} /> {t().booking.dateLabel}
                                    </label>
                                    <Input
                                        type="date"
                                        value={date()}
                                        onInput={(e) => setDate(e.currentTarget.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>

                                <Show when={date()}>
                                    <div class="flex flex-col gap-3">
                                        <label class="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <ClockIcon size={16} /> {t().booking.timeLabel}
                                        </label>

                                        <Show when={loadingBounds()}>
                                            <div class="animate-pulse text-sm text-muted-foreground">
                                                {t().booking.loadingSlots}
                                            </div>
                                        </Show>

                                        <Show when={!loadingBounds() && boundsError()}>
                                            <div class="flex flex-col gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-center text-sm text-error">
                                                <span>{boundsError()}</span>
                                                <button
                                                    type="button"
                                                    class="cursor-pointer text-xs font-semibold underline"
                                                    onClick={() => fetchBounds()}
                                                >
                                                    {t().common.retry}
                                                </button>
                                            </div>
                                        </Show>

                                        <Show
                                            when={
                                                !loadingBounds() &&
                                                !boundsError() &&
                                                generatedSlots().length > 0
                                            }
                                        >
                                            <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                <For each={generatedSlots()}>
                                                    {(slot) => (
                                                        <button
                                                            type="button"
                                                            class={`cursor-pointer rounded-lg border px-1 py-2 text-sm font-medium transition-colors ${
                                                                selectedTime() === slot
                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                    : "border-border bg-card text-foreground hover:border-primary/50"
                                                            }`}
                                                            onClick={() =>
                                                                setSelectedTime(slot)
                                                            }
                                                        >
                                                            {formatTime(slot)}
                                                        </button>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>

                                        <Show
                                            when={
                                                !loadingBounds() &&
                                                !boundsError() &&
                                                generatedSlots().length === 0
                                            }
                                        >
                                            <div class="rounded-lg border border-warning/30 bg-warning/10 p-3 text-center text-sm text-warning">
                                                {t().booking.noSlots}
                                            </div>
                                        </Show>
                                    </div>
                                </Show>
                            </Show>

                            <Show when={feedback().message && !isSuccess()}>
                                <div
                                    class={`rounded-lg border p-3 text-center text-sm ${
                                        isBlocked()
                                            ? "border-warning/30 bg-warning/10 font-medium text-warning"
                                            : "border-error/30 bg-error/10 text-error"
                                    }`}
                                >
                                    {feedback().message}
                                </div>
                            </Show>
                        </Show>
                    </div>

                    <Show when={!isSuccess()}>
                        <footer class="flex justify-end gap-3 border-t border-border bg-muted/20 p-4">
                            <Button variant="outline" onClick={handleClose}>
                                {isBlocked() ? t().common.close : t().common.cancel}
                            </Button>
                            <Show when={!isBlocked()}>
                                <Button
                                    variant="primary"
                                    onClick={handleConfirm}
                                    disabled={
                                        !date() ||
                                        !selectedTime() ||
                                        !resolvedServiceId() ||
                                        loadingSubmit()
                                    }
                                >
                                    {loadingSubmit() ? copy().submitting : copy().submit}
                                </Button>
                            </Show>
                        </footer>
                    </Show>
                </div>
            </div>
        </Show>
    );
}