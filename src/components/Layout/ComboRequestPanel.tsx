import { createResource, createSignal, For, Show } from "solid-js";
import {
    formatDate,
    formatTime,
    localizeDomain,
    t,
} from "../../core/i18n";
import { brl, combosService } from "../../services/combos.service";
import { toast } from "../../store/toastStore";
import { Button } from "../Widgets/Button";
import { Card } from "../Widgets/Card";
import { Modal } from "../Widgets/Modal";

interface Props {
    businessId: string;
}

export function ComboRequestsPanel(props: Props) {
    const [requests, { refetch }] = createResource(
        () => props.businessId,
        (id) => combosService.queue(id, "PENDING"),
    );

    const [rejecting, setRejecting] = createSignal<any>(null);
    const [reason, setReason] = createSignal("");
    const [busy, setBusy] = createSignal(false);

    const handleApprove = async (group: any) => {
        setBusy(true);
        try {
            await combosService.approve(group.id);
            toast.success(t().combos.requestPanel.approvedToast);
            refetch();
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(
                    e?.message,
                    t().combos.requestPanel.actionErrorToast,
                ),
            );
            refetch();
        } finally {
            setBusy(false);
        }
    };

    const handleReject = async () => {
        if (reason().trim().length < 5) {
            toast.error(t().combos.requestPanel.reasonMinError);
            return;
        }
        setBusy(true);
        try {
            await combosService.reject(rejecting().id, reason().trim());
            toast.success(t().combos.requestPanel.rejectedToast);
            setRejecting(null);
            setReason("");
            refetch();
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(
                    e?.message,
                    t().combos.requestPanel.actionErrorToast,
                ),
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div class="flex flex-col gap-3">
            <Show
                when={!requests.loading}
                fallback={
                    <Card>
                        <div class="p-6 text-center text-sm text-muted-foreground">
                            {t().combos.requestPanel.loading}
                        </div>
                    </Card>
                }
            >
                <Show
                    when={(requests() ?? []).length > 0}
                    fallback={
                        <Card>
                            <div class="p-6 text-center text-sm text-muted-foreground">
                                {t().combos.requestPanel.empty}
                            </div>
                        </Card>
                    }
                >
                    <For each={requests()}>
                        {(group: any) => {
                            const comboTitle = () =>
                                localizeDomain.serviceName(
                                    group.comboName || group.combo?.name || "Combo",
                                );
                            const clientName = () =>
                                group.client?.name ||
                                group.client?.user?.name ||
                                t().teamSchedule.defaultClient;
                            const finalPrice = () =>
                                Number(
                                    group.finalPrice ??
                                        group.totalPrice ??
                                        group.price ??
                                        group.combo?.price ??
                                        0,
                                );
                            const originalPrice = () =>
                                Number(group.originalPrice ?? 0);
                            const stageItems = () =>
                                group.items || group.appointments || [];

                            return (
                                <Card class="flex flex-col gap-4 p-5">
                                    <div class="flex flex-wrap items-start justify-between gap-4">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-foreground">
                                                {comboTitle()}
                                            </span>
                                            <span class="text-sm text-muted-foreground">
                                                {clientName()} ·{" "}
                                                {formatDate(group.date)} ·{" "}
                                                {formatTime(group.startTime)}
                                            </span>
                                        </div>
                                        <div class="flex flex-col items-end">
                                            <span class="font-bold text-foreground">
                                                {brl(finalPrice())}
                                            </span>
                                            <Show when={originalPrice() > 0}>
                                                <span class="text-xs text-muted-foreground line-through">
                                                    {brl(originalPrice())}
                                                </span>
                                            </Show>
                                        </div>
                                    </div>

                                    <Show when={stageItems().length > 0}>
                                        <div class="flex flex-col gap-1 border-t border-border pt-3">
                                            <For each={stageItems()}>
                                                {(item: any) => (
                                                    <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                                                        <span class="text-foreground">
                                                            {formatTime(item.startTime)}
                                                            {item.endTime
                                                                ? `–${formatTime(item.endTime)}`
                                                                : ""}{" "}
                                                            ·{" "}
                                                            {localizeDomain.serviceName(
                                                                item.serviceName ||
                                                                    item.service?.name,
                                                            )}
                                                        </span>
                                                        <span class="text-muted-foreground">
                                                            {item.professionalName ||
                                                                item.professional?.user
                                                                    ?.name ||
                                                                item.professional?.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </For>
                                        </div>
                                    </Show>

                                    <div class="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            variant="outline"
                                            class="flex-1"
                                            disabled={busy()}
                                            onClick={() => {
                                                setReason("");
                                                setRejecting(group);
                                            }}
                                        >
                                            {t().combos.requestPanel.reject}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            class="flex-1"
                                            disabled={busy()}
                                            onClick={() => handleApprove(group)}
                                        >
                                            {t().combos.requestPanel.approve}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        }}
                    </For>
                </Show>
            </Show>

            <Modal
                isOpen={!!rejecting()}
                onClose={() => setRejecting(null)}
                title={t().combos.requestPanel.rejectModalTitle}
            >
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-sm font-bold text-foreground">
                            {t().combos.requestPanel.rejectReasonLabel}
                        </label>
                        <textarea
                            rows="3"
                            class="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                            placeholder={t().combos.requestPanel.rejectPlaceholder}
                            value={reason()}
                            onInput={(e) => setReason(e.currentTarget.value)}
                        />
                    </div>

                    <div class="flex gap-2 border-t border-border pt-3">
                        <Button
                            variant="outline"
                            class="flex-1"
                            onClick={() => setRejecting(null)}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="danger"
                            class="flex-1"
                            disabled={busy() || reason().trim().length < 5}
                            onClick={handleReject}
                        >
                            {t().combos.requestPanel.confirmReject}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}