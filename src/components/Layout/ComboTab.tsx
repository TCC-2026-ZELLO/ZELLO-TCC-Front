import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import {
    convertMoneyToBrl,
    formatPercent,
    localizeDomain,
    t,
} from "../../core/i18n";
import type { CatalogItemUI } from "../../services/catalog.service";
import { brl, type ComboInput, combosService } from "../../services/combos.service";
import { toast } from "../../store/toastStore";
import { PlusIcon, TrashIcon } from "../Icons/Icons";
import { Button } from "../Widgets/Button";
import { Card } from "../Widgets/Card";
import { Input } from "../Widgets/Input";
import { Modal } from "../Widgets/Modal";

interface Props {
    businessId: string;
    services: (CatalogItemUI & { id: string })[];
}

interface DraftItem {
    serviceId: string;
    sequence: number;
}

export function CombosTab(props: Props) {
    const [combos, { refetch }] = createResource(
        () => props.businessId,
        (id) => combosService.list(id, true),
    );

    const [isOpen, setIsOpen] = createSignal(false);
    const [deleteTargetId, setDeleteTargetId] = createSignal<string | null>(null);
    const [name, setName] = createSignal("");
    const [priceInput, setPriceInput] = createSignal(0);
    const [items, setItems] = createSignal<DraftItem[]>([]);
    const [isSaving, setIsSaving] = createSignal(false);

    const serviceById = (id: string) => props.services.find((s) => s.id === id);

    const originalPriceBrl = createMemo(() =>
        items().reduce(
            (sum, item) => sum + Number(serviceById(item.serviceId)?.price ?? 0),
            0,
        ),
    );

    const priceInBrl = createMemo(() => convertMoneyToBrl(priceInput()));
    const discountBrl = createMemo(() => originalPriceBrl() - priceInBrl());

    const openModal = () => {
        setName("");
        setPriceInput(0);
        setItems([]);
        setIsOpen(true);
    };

    const toggleService = (serviceId: string) => {
        setItems((prev) =>
            prev.some((i) => i.serviceId === serviceId)
                ? prev.filter((i) => i.serviceId !== serviceId)
                : [...prev, { serviceId, sequence: prev.length }],
        );
    };

    const setSequence = (serviceId: string, sequence: number) => {
        setItems((prev) =>
            prev.map((i) => (i.serviceId === serviceId ? { ...i, sequence } : i)),
        );
    };

    const canSave = () =>
        name().trim().length >= 3 &&
        items().length >= 2 &&
        priceInBrl() > 0 &&
        discountBrl() > 0;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload: ComboInput = {
                name: name().trim(),
                price: Number(priceInBrl().toFixed(2)),
                items: items(),
            };
            await combosService.create(props.businessId, payload);
            toast.success(t().combos.toasts.created);
            setIsOpen(false);
            refetch();
        } catch (e: any) {
            toast.error(
                localizeDomain.apiError(e?.message, t().combos.toasts.saveError),
            );
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        const target = deleteTargetId();
        if (!target) return;
        try {
            await combosService.delete(target);
            toast.success(t().combos.toasts.deleted);
            setDeleteTargetId(null);
            refetch();
        } catch {
            toast.error(t().combos.toasts.deleteError);
        }
    };

    return (
        <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t().combos.countLabel(combos()?.length ?? 0)}
                </span>
                <Button variant="primary" size="sm" onClick={openModal}>
                    <div class="flex items-center gap-2">
                        <PlusIcon />
                        <span>{t().combos.newCombo}</span>
                    </div>
                </Button>
            </div>

            <Show
                when={(combos() ?? []).length > 0}
                fallback={
                    <Card>
                        <div class="p-8 text-center text-muted-foreground">
                            {t().combos.emptyHint}
                        </div>
                    </Card>
                }
            >
                <div class="flex flex-col gap-3">
                    <For each={combos()}>
                        {(combo) => (
                            <Card class="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                                <div class="flex flex-col gap-1">
                                    <span class="font-bold text-foreground">
                                        {localizeDomain.serviceName(combo.name)}
                                    </span>
                                    <span class="text-sm text-muted-foreground">
                                        {combo.stages
                                            .flatMap((s) =>
                                                s.services.map((svc) =>
                                                    localizeDomain.serviceName(svc.name),
                                                ),
                                            )
                                            .join(" + ")}
                                    </span>
                                    <Show when={combo.requiresMultipleProfessionals}>
                                        <span class="text-xs text-muted-foreground">
                                            {t().combos.simultaneousTag(
                                                combo.durationMinutes,
                                            )}
                                        </span>
                                    </Show>
                                </div>

                                <div class="flex items-center justify-between gap-6 md:justify-end">
                                    <div class="flex flex-col md:items-end">
                                        <span class="text-lg font-bold text-foreground">
                                            {brl(combo.price)}
                                        </span>
                                        <span class="text-xs text-muted-foreground line-through">
                                            {brl(combo.originalPrice)}
                                        </span>
                                        <span class="text-xs font-semibold text-success">
                                            −{formatPercent(combo.discountPercent)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label={t().common.delete}
                                        onClick={() => setDeleteTargetId(combo.id)}
                                        class="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </Card>
                        )}
                    </For>
                </div>
            </Show>

            <Modal
                isOpen={isOpen()}
                onClose={() => setIsOpen(false)}
                title={t().combos.modalTitle}
            >
                <div class="flex flex-col gap-5">
                    <Input
                        labelText={t().combos.nameLabel}
                        placeholder={t().combos.namePlaceholder}
                        value={name()}
                        onInput={(e) => setName(e.currentTarget.value)}
                    />

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-bold text-foreground">
                            {t().combos.selectServicesLabel}
                        </label>
                        <div class="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                            <For each={props.services}>
                                {(svc) => {
                                    const draft = () =>
                                        items().find((i) => i.serviceId === svc.id);
                                    return (
                                        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                                            <input
                                                type="checkbox"
                                                checked={!!draft()}
                                                onChange={() => toggleService(svc.id)}
                                                class="size-4 accent-primary"
                                            />
                                            <div class="flex min-w-0 flex-1 flex-col">
                                                <span class="truncate text-sm font-medium text-foreground">
                                                    {localizeDomain.serviceName(svc.name)}
                                                </span>
                                                <span class="text-xs text-muted-foreground">
                                                    {svc.durationMinutes}{" "}
                                                    {t().common.minutesShort} ·{" "}
                                                    {brl(Number(svc.price))}
                                                </span>
                                            </div>
                                            <Show when={draft()}>
                                                <select
                                                    class="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
                                                    value={draft()!.sequence}
                                                    onChange={(e) =>
                                                        setSequence(
                                                            svc.id,
                                                            parseInt(
                                                                e.currentTarget.value,
                                                                10,
                                                            ) || 0,
                                                        )
                                                    }
                                                >
                                                    <For each={[0, 1, 2, 3]}>
                                                        {(seq) => (
                                                            <option value={seq}>
                                                                {t().combos.stageOption(
                                                                    seq,
                                                                )}
                                                            </option>
                                                        )}
                                                    </For>
                                                </select>
                                            </Show>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                    </div>

                    <Input
                        labelText={t().combos.promoPriceLabel(t().common.currency)}
                        type="number"
                        value={priceInput().toString()}
                        onInput={(e) =>
                            setPriceInput(parseFloat(e.currentTarget.value) || 0)
                        }
                    />

                    <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/30 p-3 text-sm">
                        <span class="text-muted-foreground">
                            {t().combos.originalPriceLabel} {brl(originalPriceBrl())}
                        </span>
                        <span
                            class={
                                discountBrl() > 0
                                    ? "font-semibold text-success"
                                    : "font-semibold text-error"
                            }
                        >
                            {discountBrl() > 0
                                ? `${t().combos.discountLabel} ${brl(discountBrl())}`
                                : t().combos.discountWarning}
                        </span>
                    </div>

                    <div class="flex gap-2 border-t border-border pt-4">
                        <Button
                            variant="outline"
                            class="flex-1"
                            onClick={() => setIsOpen(false)}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            onClick={handleSave}
                            disabled={isSaving() || !canSave()}
                        >
                            {isSaving() ? t().combos.publishing : t().combos.publishCombo}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!deleteTargetId()}
                onClose={() => setDeleteTargetId(null)}
                title={t().combos.deleteTitle}
            >
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-muted-foreground">
                        {t().combos.deleteConfirm}
                    </p>
                    <div class="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTargetId(null)}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            {t().common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}