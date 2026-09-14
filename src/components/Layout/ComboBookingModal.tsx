import { createSignal, createResource, createMemo, For, Show } from "solid-js";
import { Modal } from "../Widgets/Modal";
import { Button } from "../Widgets/Button";
import { Input } from "../Widgets/Input";
import { ApiError } from "../../services/api";
import {
    brl,
    combosService,
    ComboSlotUI,
} from "../../services/combos.service";

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
        () => (props.isOpen && props.comboId ? { id: props.comboId, date: date() } : null),
        (params) => combosService.availability(params.id, params.date)
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
            props.onBooked?.();
            props.onClose();
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 409) {
                setSelected(null);
                setError("Este horário acabou de ser ocupado. Escolha outro na lista.");
                refetch();
            } else {
                setError(err.message || "Não foi possível enviar a solicitação.");
            }
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <Modal isOpen={props.isOpen} onClose={props.onClose} title={combo()?.name ?? "Combo"}>
            <div class="flex flex-col gap-5">
                <Show when={error()}>
                    <div class="p-3 bg-error/10 border border-error/20 text-error rounded-md text-sm">
                        {error()}
                    </div>
                </Show>

                <Show when={combo()}>
                    <div class="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col gap-3">
                        <div class="flex items-baseline justify-between">
                            <div class="flex items-baseline gap-3">
                                <span class="text-2xl font-bold text-foreground">
                                    {brl(combo()!.price)}
                                </span>
                                <span class="text-sm text-muted-foreground line-through">
                                    {brl(combo()!.originalPrice)}
                                </span>
                            </div>
                            <span class="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                                Economia de {brl(savings())}
                            </span>
                        </div>

                        <div class="flex flex-col gap-2">
                            <For each={combo()!.stages}>
                                {(stage) => (
                                    <div class="flex flex-col gap-1">
                                        <For each={stage.services}>
                                            {(svc) => (
                                                <div class="flex items-center justify-between text-sm">
                                                    <span class="text-foreground">{svc.name}</span>
                                                    <span class="text-muted-foreground">
                                                        {svc.durationMinutes} min · {brl(svc.price)}
                                                    </span>
                                                </div>
                                            )}
                                        </For>
                                        <Show when={stage.services.length > 1}>
                                            <span class="text-xs text-muted-foreground">
                                                Atendimento simultâneo com profissionais diferentes
                                            </span>
                                        </Show>
                                    </div>
                                )}
                            </For>
                        </div>

                        <span class="text-xs text-muted-foreground">
                            Duração total: {combo()!.durationMinutes} min
                        </span>
                    </div>
                </Show>

                <Input
                    labelText="Data"
                    type="date"
                    min={today()}
                    value={date()}
                    onInput={(e: any) => handleDate(e.target.value)}
                />

                <div class="flex flex-col gap-2">
                    <label class="text-sm font-bold text-foreground">
                        Horários com todos os profissionais livres
                    </label>

                    <Show
                        when={!slots.loading}
                        fallback={
                            <div class="text-sm text-muted-foreground">
                                Cruzando as agendas da equipe...
                            </div>
                        }
                    >
                        <Show
                            when={(slots() ?? []).length > 0}
                            fallback={
                                <div class="text-sm text-muted-foreground p-4 bg-secondary rounded-md text-center">
                                    Nesta data a equipe não consegue atender o combo inteiro.
                                    Tente outro dia.
                                </div>
                            }
                        >
                            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                <For each={slots()}>
                                    {(slot) => (
                                        <button
                                            class={`py-2 px-3 text-sm rounded-md border transition-colors ${
                                                selected()?.startTime === slot.startTime
                                                    ? "bg-primary text-primary-foreground border-primary font-bold"
                                                    : "bg-card text-foreground border-border hover:border-primary/50"
                                            }`}
                                            onClick={() => setSelected(slot)}
                                        >
                                            {slot.startTime}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </Show>
                </div>

                <Show when={selected()}>
                    <div class="rounded-xl border border-border p-4 flex flex-col gap-2">
                        <span class="text-sm font-bold text-foreground">
                            Como fica o seu atendimento
                        </span>
                        <For each={selected()!.assignments}>
                            {(a) => (
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-foreground">
                                        {a.startTime} · {a.serviceName}
                                    </span>
                                    <span class="text-muted-foreground">{a.professionalName}</span>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>

                <div class="flex gap-2 pt-4 border-t border-border">
                    <Button variant="outline" class="flex-1" onClick={props.onClose}>
                        Voltar
                    </Button>
                    <Button
                        variant="primary"
                        class="flex-1"
                        onClick={handleConfirm}
                        disabled={isBooking() || !selected()}
                    >
                        {isBooking() ? "Enviando..." : "Solicitar combo"}
                    </Button>
                </div>

                <p class="text-xs text-muted-foreground text-center">
                    O estabelecimento precisa aprovar a solicitação. Você recebe o aviso
                    assim que houver resposta.
                </p>
            </div>
        </Modal>
    );
}