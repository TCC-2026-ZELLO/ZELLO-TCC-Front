import { createSignal, createResource, For, Show } from "solid-js";
import { Card } from "../Widgets/Card";
import { Button } from "../Widgets/Button";
import { Modal } from "../Widgets/Modal";
import { toast } from "../../store/toastStore";
import { brl, combosService } from "../../services/combos.service";

interface Props {
    businessId: string;
}

export function ComboRequestsPanel(props: Props) {
    const [requests, { refetch }] = createResource(
        () => props.businessId,
        (id) => combosService.queue(id, "PENDING")
    );

    const [rejecting, setRejecting] = createSignal<any>(null);
    const [reason, setReason] = createSignal("");
    const [busy, setBusy] = createSignal(false);

    const handleApprove = async (group: any) => {
        setBusy(true);
        try {
            await combosService.approve(group.id);
            toast.success("Combo confirmado e agendas bloqueadas.");
            refetch();
        } catch (e: any) {
            toast.error(
                e.message ||
                "Um dos profissionais ficou indisponível. Recuse a solicitação para liberar o cliente."
            );
            refetch();
        } finally {
            setBusy(false);
        }
    };

    const handleReject = async () => {
        if (reason().trim().length < 10) return;
        setBusy(true);
        try {
            await combosService.reject(rejecting().id, reason().trim());
            toast.success("Solicitação recusada e cliente notificado.");
            setRejecting(null);
            setReason("");
            refetch();
        } catch (e: any) {
            toast.error(e.message || "Não foi possível recusar a solicitação.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div class="flex flex-col gap-3">
            <Show
                when={(requests() ?? []).length > 0}
                fallback={
                    <Card>
                        <div class="p-8 text-center text-muted-foreground">
                            Nenhuma solicitação de combo aguardando resposta.
                        </div>
                    </Card>
                }
            >
                <For each={requests()}>
                    {(group: any) => (
                        <Card class="p-5 flex flex-col gap-4">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex flex-col">
                                    <span class="font-bold text-foreground">{group.comboName}</span>
                                    <span class="text-sm text-muted-foreground">
                                        {group.client?.name} · {group.date} às {group.startTime}
                                    </span>
                                </div>
                                <div class="flex flex-col items-end">
                                    <span class="font-bold text-foreground">
                                        {brl(group.finalPrice)}
                                    </span>
                                    <span class="text-xs text-muted-foreground line-through">
                                        {brl(group.originalPrice)}
                                    </span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1 border-t border-border pt-3">
                                <For each={group.items}>
                                    {(item: any) => (
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-foreground">
                                                {item.startTime}–{item.endTime} · {item.serviceName}
                                            </span>
                                            <span class="text-muted-foreground">
                                                {item.professionalName}
                                            </span>
                                        </div>
                                    )}
                                </For>
                            </div>

                            <div class="flex gap-2">
                                <Button
                                    variant="outline"
                                    class="flex-1"
                                    disabled={busy()}
                                    onClick={() => {
                                        setReason("");
                                        setRejecting(group);
                                    }}
                                >
                                    Recusar
                                </Button>
                                <Button
                                    variant="primary"
                                    class="flex-1"
                                    disabled={busy()}
                                    onClick={() => handleApprove(group)}
                                >
                                    Aprovar combo
                                </Button>
                            </div>
                        </Card>
                    )}
                </For>
            </Show>

            <Modal
                isOpen={!!rejecting()}
                onClose={() => setRejecting(null)}
                title="Recusar solicitação"
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">
                        A recusa cancela o combo inteiro. O cliente é avisado de que precisa
                        montar um novo agendamento do início.
                    </p>

                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-bold text-foreground">
                            Motivo da recusa
                        </label>
                        <textarea
                            rows="3"
                            class="rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ex: a manicure ficou indisponível neste horário"
                            value={reason()}
                            onInput={(e) => setReason(e.currentTarget.value)}
                        />
                        <span class="text-xs text-muted-foreground">
                            Mínimo de 10 caracteres.
                        </span>
                    </div>

                    <div class="flex gap-2 pt-2 border-t border-border">
                        <Button variant="outline" class="flex-1" onClick={() => setRejecting(null)}>
                            Voltar
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            disabled={busy() || reason().trim().length < 10}
                            onClick={handleReject}
                        >
                            Recusar e notificar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}