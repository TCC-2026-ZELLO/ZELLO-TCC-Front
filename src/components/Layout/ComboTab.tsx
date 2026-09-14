import { createSignal, createResource, createMemo, For, Show } from "solid-js";
import { Card } from "../Widgets/Card";
import { Button } from "../Widgets/Button";
import { Input } from "../Widgets/Input";
import { Modal } from "../Widgets/Modal";
import { TrashIcon, PlusIcon } from "../Icons/Icons";
import { toast } from "../../store/toastStore";
import { brl, combosService, ComboInput } from "../../services/combos.service";
import { CatalogItemUI } from "../../services/catalog.service";

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
        (id) => combosService.list(id, true)
    );

    const [isOpen, setIsOpen] = createSignal(false);
    const [name, setName] = createSignal("");
    const [price, setPrice] = createSignal(0);
    const [items, setItems] = createSignal<DraftItem[]>([]);
    const [isSaving, setIsSaving] = createSignal(false);

    const serviceById = (id: string) => props.services.find((s) => s.id === id);

    const originalPrice = createMemo(() =>
        items().reduce((sum, item) => sum + Number(serviceById(item.serviceId)?.price ?? 0), 0)
    );

    const discount = createMemo(() => originalPrice() - price());

    const openModal = () => {
        setName("");
        setPrice(0);
        setItems([]);
        setIsOpen(true);
    };

    const toggleService = (serviceId: string) => {
        setItems((prev) =>
            prev.some((i) => i.serviceId === serviceId)
                ? prev.filter((i) => i.serviceId !== serviceId)
                : [...prev, { serviceId, sequence: prev.length }]
        );
    };

    const setSequence = (serviceId: string, sequence: number) => {
        setItems((prev) =>
            prev.map((i) => (i.serviceId === serviceId ? { ...i, sequence } : i))
        );
    };

    const canSave = () =>
        name().trim().length >= 3 && items().length >= 2 && price() > 0 && discount() > 0;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload: ComboInput = {
                name: name().trim(),
                price: price(),
                items: items(),
            };
            await combosService.create(props.businessId, payload);
            toast.success("Combo publicado no catálogo.");
            setIsOpen(false);
            refetch();
        } catch (e: any) {
            toast.error(e.message || "Não foi possível salvar o combo.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remover este combo do catálogo?")) return;
        try {
            await combosService.delete(id);
            toast.success("Combo removido.");
            refetch();
        } catch {
            toast.error("Não foi possível remover o combo.");
        }
    };

    return (
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {combos()?.length ?? 0} combos
                </span>
                <Button variant="primary" size="sm" onClick={openModal}>
                    <div class="flex items-center gap-2">
                        <PlusIcon />
                        <span>Novo combo</span>
                    </div>
                </Button>
            </div>

            <Show
                when={(combos() ?? []).length > 0}
                fallback={
                    <Card>
                        <div class="p-8 text-center text-muted-foreground">
                            Agrupe dois ou mais serviços com um preço promocional para
                            aumentar o ticket médio.
                        </div>
                    </Card>
                }
            >
                <div class="flex flex-col gap-3">
                    <For each={combos()}>
                        {(combo) => (
                            <Card class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div class="flex flex-col gap-1">
                                    <span class="font-bold text-foreground">{combo.name}</span>
                                    <span class="text-sm text-muted-foreground">
                                        {combo.stages
                                            .flatMap((s) => s.services.map((svc) => svc.name))
                                            .join(" + ")}
                                    </span>
                                    <Show when={combo.requiresMultipleProfessionals}>
                                        <span class="text-xs text-muted-foreground">
                                            Exige profissionais simultâneos · {combo.durationMinutes} min
                                        </span>
                                    </Show>
                                </div>

                                <div class="flex items-center gap-6">
                                    <div class="flex flex-col items-end">
                                        <span class="font-bold text-lg text-foreground">
                                            {brl(combo.price)}
                                        </span>
                                        <span class="text-xs text-muted-foreground line-through">
                                            {brl(combo.originalPrice)}
                                        </span>
                                        <span class="text-xs text-emerald-600 font-semibold">
                                            −{combo.discountPercent}%
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => handleDelete(combo.id)}
                                        class="text-muted-foreground hover:text-error transition-colors cursor-pointer p-2"
                                    >
                                        <TrashIcon />
                                    </div>
                                </div>
                            </Card>
                        )}
                    </For>
                </div>
            </Show>

            <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} title="Novo combo">
                <div class="flex flex-col gap-5">
                    <Input
                        labelText="Nome do combo"
                        placeholder="Ex: Dia da Noiva"
                        value={name()}
                        onInput={(e: any) => setName(e.currentTarget.value)}
                    />

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-bold text-foreground">
                            Serviços incluídos
                        </label>
                        <div class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                            <For each={props.services}>
                                {(svc) => {
                                    const draft = () => items().find((i) => i.serviceId === svc.id);
                                    return (
                                        <div class="flex items-center gap-3 p-3 rounded-lg border border-border">
                                            <input
                                                type="checkbox"
                                                checked={!!draft()}
                                                onChange={() => toggleService(svc.id)}
                                            />
                                            <div class="flex flex-col flex-1">
                                                <span class="text-sm font-medium text-foreground">
                                                    {svc.name}
                                                </span>
                                                <span class="text-xs text-muted-foreground">
                                                    {svc.durationMinutes} min · {brl(Number(svc.price))}
                                                </span>
                                            </div>
                                            <Show when={draft()}>
                                                <label class="text-xs text-muted-foreground flex items-center gap-2">
                                                    Etapa
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        class="w-14 h-8 rounded-md border border-input bg-card px-2 text-sm"
                                                        value={draft()!.sequence}
                                                        onInput={(e: any) =>
                                                            setSequence(
                                                                svc.id,
                                                                parseInt(e.currentTarget.value) || 0
                                                            )
                                                        }
                                                    />
                                                </label>
                                            </Show>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            Serviços na mesma etapa acontecem ao mesmo tempo, com
                            profissionais diferentes. Etapas maiores entram na sequência.
                        </p>
                    </div>

                    <Input
                        labelText="Valor promocional (R$)"
                        type="number"
                        value={price().toString()}
                        onInput={(e: any) => setPrice(parseFloat(e.currentTarget.value) || 0)}
                    />

                    <div class="rounded-lg bg-secondary/30 p-3 flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">
                            Soma dos serviços: {brl(originalPrice())}
                        </span>
                        <span
                            class={
                                discount() > 0
                                    ? "font-semibold text-emerald-600"
                                    : "font-semibold text-error"
                            }
                        >
                            {discount() > 0
                                ? `Desconto de ${brl(discount())}`
                                : "O valor precisa ser menor que a soma"}
                        </span>
                    </div>

                    <div class="flex gap-2 pt-4 border-t border-border">
                        <Button variant="outline" class="flex-1" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            onClick={handleSave}
                            disabled={isSaving() || !canSave()}
                        >
                            {isSaving() ? "Salvando..." : "Publicar combo"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}