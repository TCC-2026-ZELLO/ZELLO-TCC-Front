import { createSignal, createEffect, Show, For } from "solid-js";
import { Button } from "./Button";
import { Input } from "./Input";
import { availabilityService, Bound } from "~/services/availability.service";
import { appointmentsService } from "~/services/appointments.service";
import { CalendarIcon, ClockIcon, XIcon, CheckCircleIcon } from "~/components/Icons/Icons";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    professionalId: string;
    businessId: string;
    serviceId: string;
    serviceName: string;
    durationMinutes: number;
    price: number | string;
}

export function BookingModal(props: BookingModalProps) {
    const [date, setDate] = createSignal("");
    const [bounds, setBounds] = createSignal<Bound[]>([]);
    const [loadingBounds, setLoadingBounds] = createSignal(false);
    const [selectedTime, setSelectedTime] = createSignal("");
    const [loadingSubmit, setLoadingSubmit] = createSignal(false);
    const [feedback, setFeedback] = createSignal({ type: "", message: "" });
    const [isSuccess, setIsSuccess] = createSignal(false);

    const generatedSlots = () => {
        const slots: string[] = [];
        const duration = props.durationMinutes;

        const now = new Date();
        const currentDateStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
        const currentMins = now.getHours() * 60 + now.getMinutes();

        bounds().forEach((bound) => {
            let current = timeToMins(bound.start);
            const end = timeToMins(bound.end);

            while (current + duration <= end) {
                // Filtra horários do passado e exige 30 minutos de antecedência
                if (!(date() === currentDateStr && current < currentMins + 30)) {
                    slots.push(minsToTime(current));
                }
                current += duration;
            }
        });

        return slots;
    };

    const timeToMins = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    const minsToTime = (m: number) => {
        const hh = Math.floor(m / 60).toString().padStart(2, '0');
        const mm = (m % 60).toString().padStart(2, '0');
        return `${hh}:${mm}`;
    };

    createEffect(async () => {
        if (!date() || !props.isOpen) {
            setBounds([]);
            setSelectedTime("");
            return;
        }

        setLoadingBounds(true);
        setSelectedTime("");
        try {
            const res = await availabilityService.getBounds({
                date: date(),
                professionalId: props.professionalId,
                businessId: props.businessId,
                serviceId: props.serviceId,
            });
            // Dependendo do retorno da API, ajustar se necessário (res.data ou res)
            setBounds(Array.isArray(res) ? res : ((res as any).data || []));
        } catch (err) {
            console.error("Erro ao buscar horários", err);
            setBounds([]);
        } finally {
            setLoadingBounds(false);
        }
    });

    const handleConfirm = async () => {
        if (!date() || !selectedTime()) {
            setFeedback({ type: "error", message: "Selecione uma data e horário." });
            return;
        }
        setLoadingSubmit(true);
        setFeedback({ type: "", message: "" });
        try {
            const response = await appointmentsService.create({
                professionalId: props.professionalId,
                businessId: props.businessId,
                serviceId: props.serviceId,
                date: date(),
                startTime: selectedTime()
            });
            setIsSuccess(true);
            setFeedback({ type: "success", message: response.message || "Pedido enviado e aguarda aprovação" });
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (err: any) {
            setFeedback({ type: "error", message: err.message || "Erro ao solicitar agendamento" });
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleClose = () => {
        setDate("");
        setSelectedTime("");
        setFeedback({ type: "", message: "" });
        setIsSuccess(false);
        props.onClose();
    };

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div class="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200">
                    <header class="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                        <h2 class="text-lg font-bold text-foreground">Solicitar Reserva</h2>
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
                                <h3 class="text-xl font-bold text-foreground">Sucesso!</h3>
                                <p class="text-muted-foreground">{feedback().message}</p>
                            </div>
                        </Show>

                        <Show when={!isSuccess()}>
                            <div class="flex flex-col gap-1 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <span class="font-bold text-primary">{props.serviceName}</span>
                                <div class="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span class="flex items-center gap-1"><ClockIcon size={14}/> {props.durationMinutes} min</span>
                                    <span class="font-bold text-foreground">R$ {props.price}</span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <CalendarIcon size={16}/> Escolha a data
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
                                        <ClockIcon size={16}/> Horários disponíveis
                                    </label>
                                    
                                    <Show when={loadingBounds()}>
                                        <div class="text-sm text-muted-foreground animate-pulse">Carregando horários...</div>
                                    </Show>

                                    <Show when={!loadingBounds() && generatedSlots().length > 0}>
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

                                    <Show when={!loadingBounds() && generatedSlots().length === 0}>
                                        <div class="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                            Nenhum horário disponível para esta data.
                                        </div>
                                    </Show>
                                </div>
                            </Show>

                            <Show when={feedback().message && !isSuccess()}>
                                <div class="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                    {feedback().message}
                                </div>
                            </Show>
                        </Show>
                    </div>

                    <Show when={!isSuccess()}>
                        <footer class="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                            <Button 
                                variant="primary" 
                                onClick={handleConfirm} 
                                disabled={!date() || !selectedTime() || loadingSubmit()}
                            >
                                {loadingSubmit() ? "Enviando..." : "Confirmar Solicitação"}
                            </Button>
                        </footer>
                    </Show>
                </div>
            </div>
        </Show>
    );
}
