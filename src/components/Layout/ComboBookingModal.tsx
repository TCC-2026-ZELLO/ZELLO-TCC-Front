import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { formatTime, localizeDomain, t } from "../../core/i18n";
import { ApiError } from "../../services/api";
import {
    brl,
    type ComboSlotUI,
    combosService,
} from "../../services/combos.service";
import { toast } from "../../store/toastStore";
import { Button } from "../Widgets/Button";
import { Input } from "../Widgets/Input";
import { Modal } from "../Widgets/Modal";

interface Props {
    comboId: string;
    isOpen: boolean;
    onClose: () => void;
    onBooked?: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export function ComboBookingModal(props: Props) {
    const [date, setDate] = createSignal(today());
    const [selected, setSelected] = createSignal<ComboSlotUI | null>(null);
    const [error, setError] = createSignal("");
    const [isBooking, setIsBooking] = createSignal(false);

    const [combo] = createResource(() => props.comboId, combosService.getById);

    const [slots, { refetch }] = createResource(
        () =>
            props.isOpen && props.comboId
                ? { id: props.comboId, date: date() }
                : null,
        (params) => combosService.availability(params.id, params.date),
    );

    const savings = createMemo(() => combo()?.discount ?? 0);

    const handleDate = (value: string) => {
        setDate(value);
        setSelected(null);
        setError("");
    };

    const handleConfirm = async () => {
        const slot = selected();
        if (!slot) return;

        setIsBooking(true);
        setError("");
        try {
            await combosService.book(props.comboId, {
                date: date(),
                startTime: slot.startTime,
                professionals: slot.assignments.map((a) => ({
                    serviceId: a.serviceId,
                    professionalId: a.professionalId,
                })),
            });
            toast.success(t().combos.bookingModal.successToast);
            props.onBooked?.();
            props.onClose();
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 409) {
                setSelected(null);
                setError(t().booking.slotTaken);
                refetch();
            } else {
                setError(
                    localizeDomain.apiError(
                        err?.message,
                        t().combos.bookingModal.errorToast,
                    ),
                );
            }
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={
                combo()?.name
                    ? localizeDomain.serviceName(combo()!.name)
                    : t().combos.bookingModal.title
            }
        >
            <div class="flex flex-col gap-5">
                <Show when={error()}>
                    <div class="rounded-md border border-error/25 bg-error/10 p-3 text-sm text-error">
                        {error()}
                    </div>
                </Show>

                <Show when={combo()}>
                    <div class="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-4">
                        <div class="flex flex-wrap items-baseline justify-between gap-2">
                            <div class="flex items-baseline gap-3">
                                <span class="text-2xl font-bold text-foreground">
                                    {brl(combo()!.price)}
                                </span>
                                <span class="text-sm text-muted-foreground line-through">
                                    {brl(combo()!.originalPrice)}
                                </span>
                            </div>
                            <span class="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                                {t().combos.bookingModal.savingsBadge(brl(savings()))}
                            </span>
                        </div>

                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-bold uppercase text-muted-foreground">
                                {t().combos.bookingModal.includedServices}
                            </span>
                            <For each={combo()!.stages}>
                                {(stage) => (
                                    <div class="flex flex-col gap-1">
                                        <For each={stage.services}>
                                            {(svc) => (
                                                <div class="flex items-center justify-between gap-2 text-sm">
                                                    <span class="text-foreground">
                                                        {localizeDomain.serviceName(
                                                            svc.name,
                                                        )}
                                                    </span>
                                                    <span class="text-muted-foreground">
                                                        {svc.durationMinutes}{" "}
                                                        {t().common.minutesShort} ·{" "}
                                                        {brl(svc.price)}
                                                    </span>
                                                </div>
                                            )}
                                        </For>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>
                </Show>

                <Input
                    labelText={t().combos.bookingModal.chooseDate}
                    type="date"
                    min={today()}
                    value={date()}
                    onInput={(e) => handleDate(e.currentTarget.value)}
                />

                <div class="flex flex-col gap-2">
                    <label class="text-sm font-bold text-foreground">
                        {t().combos.bookingModal.availableSlots}
                    </label>

                    <Show
                        when={!slots.loading}
                        fallback={
                            <div class="text-sm text-muted-foreground">
                                {t().combos.bookingModal.loadingSlots}
                            </div>
                        }
                    >
                        <Show
                            when={(slots() ?? []).length > 0}
                            fallback={
                                <div class="rounded-md bg-secondary p-4 text-center text-sm text-muted-foreground">
                                    {t().combos.bookingModal.noSlots}
                                </div>
                            }
                        >
                            <div class="grid max-h-40 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                                <For each={slots()}>
                                    {(slot) => (
                                        <button
                                            type="button"
                                            class={`cursor-pointer rounded-md border px-2 py-2 text-sm transition-colors ${
                                                selected()?.startTime === slot.startTime
                                                    ? "border-primary bg-primary font-bold text-primary-foreground"
                                                    : "border-border bg-card text-foreground hover:border-primary/50"
                                            }`}
                                            onClick={() => setSelected(slot)}
                                        >
                                            {formatTime(slot.startTime)}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </Show>
                </div>

                <Show when={selected()}>
                    <div class="flex flex-col gap-2 rounded-xl border border-border p-4">
                        <For each={selected()!.assignments}>
                            {(a) => (
                                <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span class="text-foreground">
                                        {formatTime(a.startTime)} ·{" "}
                                        {localizeDomain.serviceName(a.serviceName)}
                                    </span>
                                    <span class="text-muted-foreground">
                                        {a.professionalName}
                                    </span>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>

                <div class="flex gap-2 border-t border-border pt-4">
                    <Button variant="outline" class="flex-1" onClick={props.onClose}>
                        {t().common.back}
                    </Button>
                    <Button
                        variant="primary"
                        class="flex-1"
                        onClick={handleConfirm}
                        disabled={isBooking() || !selected()}
                    >
                        {isBooking()
                            ? t().combos.bookingModal.submitting
                            : t().combos.bookingModal.confirmBooking}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}