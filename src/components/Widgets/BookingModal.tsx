import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import { Button } from "./Button";
import { Input } from "./Input";
import { availabilityService, Bound, BoundsParams } from "../../services/availability.service";
import { appointmentsService } from "../../services/appointments.service";
import { ApiError } from "../../services/api";
import { CalendarIcon, ClockIcon, XIcon, CheckCircleIcon } from "../Icons/Icons";
import { t } from "../../store/appState";

const BOUNDS_POLLING_INTERVAL_MS = 20000;

export type BookingMode = "create" | "reschedule" | "propose";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    mode?: BookingMode;
    appointmentId?: string;
    initialDate?: string;
    professionalId: string;
    businessId: string;
    serviceId: string;
    serviceName: string;
    durationMinutes: number;
    price?: number | string;
}

export function BookingModal(props: BookingModalProps) {
    const [date, setDate] = createSignal("");
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
    const missingContext = () => !props.businessId || !props.serviceId || !props.professionalId;
    const generatedSlots = () =>
        availabilityService.generateAvailableSlots(bounds(), props.durationMinutes);

    const currentBoundsParams = (): BoundsParams => ({
        date: date(),
        professionalId: props.professionalId,
        businessId: props.businessId,
        serviceId: props.serviceId,
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
            console.error("Erro ao buscar horários", err);
            if (!cached) {
                setBounds([]);
                setBoundsError(
                    err instanceof ApiError
                        ? err.message || t().booking.loadError
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
        setSelectedTime("");
        setBoundsError("");
        setFeedback({ type: "", message: "" });
        setIsSuccess(false);
    });

    createEffect(() => {
        if (!date() || !props.isOpen) {
            setBounds([]);
            setSelectedTime("");
            return;
        }

        setSelectedTime("");
        fetchBounds();
    });

   createEffect(() => {
        if (!date() || !props.isOpen) return;

        const interval = setInterval(fetchBounds, BOUNDS_POLLING_INTERVAL_MS);
        onCleanup(() => clearInterval(interval));
    });

    const submit = async () => {
        const payload = { date: date(), startTime: selectedTime() };

        switch (mode()) {
            case "reschedule":
                return appointmentsService.reschedule(props.appointmentId!, payload);
            case "propose":
                return appointmentsService.proposeReschedule(props.appointmentId!, payload);
            default:
                return appointmentsService.create({
                    professionalId: props.professionalId,
                    businessId: props.businessId,
                    serviceId: props.serviceId,
                    ...payload,
                });
        }
    };

    const handleConfirm = async () => {
        if (!date() || !selectedTime()) {
            setFeedback({ type: "error", message: t().booking.selectDateTime });
            return;
        }

        setLoadingSubmit(true);
        setFeedback({ type: "", message: "" });

        try {
            const response = await submit();

            setIsSuccess(true);
            setFeedback({
                type: "success",
                message: response?.message || copy().success,
            });
            props.onSuccess?.();

            setTimeout(() => handleClose(), 3000);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 409) {
                setSelectedTime("");
                setFeedback({ type: "error", message: err.message || t().booking.slotTaken });
                fetchBounds();
            } else if (err instanceof ApiError && err.status === 422) {
                setFeedback({ type: "blocked", message: err.message || t().booking.limitReached });
            } else {
                setFeedback({ type: "error", message: err.message || t().common.genericError });
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
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div class="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200">
                    <header class="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                        <h2 class="text-lg font-bold text-foreground">{copy().title}</h2>
                        <button onClick={handleClose} class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
                            <XIcon size={20} />
                        </button>
                    </header>

                    <div class="p-5 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
                        <Show when={isSuccess()}>
                            <div class="flex flex-col items-center justify-center py-8 text-center gap-4">
                                <div class="size-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                    <CheckCircleIcon size={32} />
                                </div>
                                <h3 class="text-xl font-bold text-foreground">{t().booking.successTitle}</h3>
                                <p class="text-muted-foreground">{feedback().message}</p>
                            </div>
                        </Show>

                        <Show when={!isSuccess()}>
                            <div class="flex flex-col gap-1 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <span class="font-bold text-primary">{props.serviceName}</span>
                                <div class="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span class="flex items-center gap-1">
                                        <ClockIcon size={14}/> {props.durationMinutes} {t().common.minutesShort}
                                    </span>
                                    <Show when={props.price !== undefined && props.price !== null}>
                                        <span class="font-bold text-foreground">{t().common.currency} {props.price}</span>
                                    </Show>
                                </div>
                            </div>

                            <Show when={mode() === "propose"}>
                                <p class="text-sm text-muted-foreground">{t().booking.proposeHint}</p>
                            </Show>

                            <Show when={!isBlocked()}>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <CalendarIcon size={16}/> {t().booking.dateLabel}
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
                                        <label class="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <ClockIcon size={16}/> {t().booking.timeLabel}
                                        </label>

                                        <Show when={loadingBounds()}>
                                            <div class="text-sm text-muted-foreground animate-pulse">{t().booking.loadingSlots}</div>
                                        </Show>

                                        <Show when={!loadingBounds() && boundsError()}>
                                            <div class="flex flex-col gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                                <span>{boundsError()}</span>
                                                <button
                                                    class="text-xs font-semibold underline text-red-500 hover:text-red-600"
                                                    onClick={() => fetchBounds()}
                                                >
                                                    {t().common.retry}
                                                </button>
                                            </div>
                                        </Show>

                                        <Show when={!loadingBounds() && !boundsError() && generatedSlots().length > 0}>
                                            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                <For each={generatedSlots()}>
                                                    {(slot) => (
                                                        <button
                                                            class={`py-2 px-1 rounded-lg text-sm font-medium border transition-colors ${
                                                                selectedTime() === slot
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "bg-card text-foreground border-border hover:border-primary/50"
                                                            }`}
                                                            onClick={() => setSelectedTime(slot)}
                                                        >
                                                            {slot}
                                                        </button>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>

                                        <Show when={!loadingBounds() && !boundsError() && generatedSlots().length === 0}>
                                            <div class="text-sm text-amber-600 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-center">
                                                {t().booking.noSlots}
                                            </div>
                                        </Show>
                                    </div>
                                </Show>
                            </Show>

                            <Show when={feedback().message && !isSuccess()}>
                                <div class={`text-sm p-3 rounded-lg border text-center ${
                                    isBlocked()
                                        ? "text-amber-600 bg-amber-500/10 border-amber-500/20 font-medium"
                                        : "text-red-500 bg-red-500/10 border-red-500/20"
                                }`}>
                                    {feedback().message}
                                </div>
                            </Show>
                        </Show>
                    </div>

                    <Show when={!isSuccess()}>
                        <footer class="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose}>
                                {isBlocked() ? t().common.close : t().common.cancel}
                            </Button>
                            <Show when={!isBlocked()}>
                                <Button
                                    variant="primary"
                                    onClick={handleConfirm}
                                    disabled={!date() || !selectedTime() || loadingSubmit()}
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