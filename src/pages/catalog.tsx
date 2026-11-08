import { createResource, createSignal, For, Show } from "solid-js";
import { BriefcaseIcon, ClockIcon, EditIcon, PlusIcon, TrashIcon } from "../components/Icons/Icons";
import { CombosTab } from "../components/Layout/ComboTab";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { IconButton } from "../components/Widgets/IconButton";
import { Input } from "../components/Widgets/Input";
import { Modal } from "../components/Widgets/Modal";
import { Switch } from "../components/Widgets/Switch";
import { Tabs } from "../components/Widgets/Tabs";
import {
    convertMoneyFromBrl,
    convertMoneyToBrl,
    formatInteger,
    formatMoney,
    formatMoneyHint,
    localeStrategy,
    localizeDomain,
    t,
} from "../core/i18n";
import { type CatalogItemUI, catalogService } from "../services/catalog.service";
import { activeBusiness } from "../store/appState";
import { toast } from "../store/toastStore";

const CATEGORY_KEYS = ["Todos", "Cabelo", "Barba", "Estética", "Unhas"] as const;
const SERVICE_CATEGORIES = ["Cabelo", "Barba", "Estética", "Unhas"] as const;

export default function CatalogPage() {
    const [activeTab, setActiveTab] = createSignal("servicos");
    const [filter, setFilter] = createSignal<string>("Todos");
    const [search, setSearch] = createSignal("");

    const businessId = () => activeBusiness()?.businessId || false;
    const [services, { refetch }] = createResource(businessId, catalogService.list);

    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [editingId, setEditingId] = createSignal<string | null>(null);
    const [deleteTargetId, setDeleteTargetId] = createSignal<string | null>(null);
    const [isSaving, setIsSaving] = createSignal(false);

    const defaultForm: CatalogItemUI = {
        name: "",
        category: "Cabelo",
        price: 0,
        durationMinutes: 30,
        cleanupMinutes: 0,
        active: true,
    };
    const [formData, setFormData] = createSignal<CatalogItemUI>({ ...defaultForm });
    const [priceInput, setPriceInput] = createSignal("0");

    const filteredServices = () => {
        const list = services() || [];
        const q = search().trim().toLowerCase();
        return list.filter((item) => {
            const localizedName = localizeDomain.serviceName(item.name).toLowerCase();
            const matchesSearch =
                !q ||
                item.name.toLowerCase().includes(q) ||
                localizedName.includes(q);
            const matchesFilter = filter() === "Todos" || item.category === filter();
            return matchesSearch && matchesFilter;
        });
    };

    const openAddModal = () => {
        setFormData({ ...defaultForm });
        setPriceInput("0");
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: CatalogItemUI & { id: string }) => {
        const convertedPrice = Math.round(convertMoneyFromBrl(item.price) * 100) / 100;
        setFormData({
            name: item.name,
            category: item.category || "Cabelo",
            price: item.price,
            durationMinutes: item.durationMinutes,
            cleanupMinutes: item.cleanupMinutes || 0,
            active: item.active ?? true,
        });
        setPriceInput(convertedPrice.toString());
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const bId = businessId();
        const parsedPrice = parseFloat(priceInput());
        if (!bId || !formData().name.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0) return;

        const priceBrl = Math.round(convertMoneyToBrl(parsedPrice) * 100) / 100;
        const payload: CatalogItemUI = {
            ...formData(),
            name: formData().name.trim(),
            price: priceBrl,
        };

        setIsSaving(true);
        try {
            if (editingId()) {
                await catalogService.update(editingId() as string, payload);
                toast.success(t().catalog.toasts.updated);
            } else {
                await catalogService.create(bId as string, payload);
                toast.success(t().catalog.toasts.created);
            }
            setIsModalOpen(false);
            await refetch();
        } catch {
            toast.error(t().catalog.toasts.saveError);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        const id = deleteTargetId();
        if (!id) return;
        setIsSaving(true);
        try {
            await catalogService.delete(id);
            toast.success(t().catalog.toasts.deleted);
            setDeleteTargetId(null);
            await refetch();
        } catch {
            toast.error(t().catalog.toasts.deleteError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = () => {
        toast.info(t().catalog.toasts.statusUnsupported);
    };

    return (
        <div class="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
            {/* --- HEADER --- */}
            <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold text-foreground">
                        {t().catalog.title}
                    </h1>
                    <p class="text-sm sm:text-base text-muted-foreground mt-1">
                        {t().catalog.managing}{" "}
                        <span class="font-medium text-foreground">
                            {activeBusiness()?.name || t().catalog.loadingBiz}
                        </span>
                    </p>
                </div>

                <Show when={activeTab() === "servicos"}>
                    <Button
                        variant="primary"
                        disabled={!businessId()}
                        onClick={openAddModal}
                        class="w-full sm:w-auto"
                    >
                        <div class="flex items-center justify-center gap-2">
                            <PlusIcon />
                            <span>{t().catalog.newService}</span>
                        </div>
                    </Button>
                </Show>
            </header>

            {/* --- RESUMO --- */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                    <div class="flex items-center gap-4">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                            <BriefcaseIcon />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-foreground">
                                {formatInteger(services()?.length || 0)}
                            </div>
                            <div class="text-sm text-muted-foreground">
                                {t().catalog.registeredServices}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div class="flex flex-wrap items-center justify-between gap-4 h-full">
                        <div class="flex flex-col">
                            <span class="font-bold text-foreground">
                                {t().catalog.generalAvailability}
                            </span>
                            <span class="text-sm text-muted-foreground">
                                {t().catalog.generalAvailabilityDesc}
                            </span>
                        </div>
                        <Switch
                            checked={true}
                            label={t().catalog.storeOpen}
                            onChange={handleToggleStatus}
                        />
                    </div>
                </Card>
            </div>

            {/* --- ABAS --- */}
            <Tabs
                activeValue={activeTab()}
                onChange={(val) => setActiveTab(val)}
                items={[
                    { label: t().catalog.tabs.services, value: "servicos" },
                    { label: t().catalog.tabs.combos, value: "combos" },
                ]}
            />

            <Show
                when={activeTab() === "servicos"}
                fallback={
                    <Show
                        when={businessId()}
                        fallback={
                            <Card>
                                <div class="p-8 text-center text-muted-foreground">
                                    {t().catalog.selectBizForCombos}
                                </div>
                            </Card>
                        }
                    >
                        <CombosTab
                            businessId={businessId() as string}
                            services={(services() ?? []) as any}
                        />
                    </Show>
                }
            >
                <div class="flex flex-col gap-6 sm:gap-8">
                    {/* --- CONTROLES E FILTROS --- */}
                    <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                        <div class="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
                            <For each={CATEGORY_KEYS}>
                                {(cat) => (
                                    <Button
                                        variant={filter() === cat ? "primary" : "outline"}
                                        size="sm"
                                        onClick={() => setFilter(cat)}
                                        class="shrink-0"
                                    >
                                        {cat === "Todos"
                                            ? t().common.all
                                            : localizeDomain.category(cat)}
                                    </Button>
                                )}
                            </For>
                        </div>

                        <div class="w-full sm:w-72">
                            <Input
                                searchIcon
                                placeholder={t().catalog.searchPlaceholder}
                                value={search()}
                                onInput={(e) => setSearch(e.currentTarget.value)}
                            />
                        </div>
                    </div>

                    {/* --- LISTA DE CATÁLOGO --- */}
                    <Card class="p-0 overflow-hidden">
                        <div class="flex flex-col">
                            <div class="px-4 sm:px-6 py-4 bg-muted/30 border-b border-border flex justify-between items-center">
                                <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t().catalog.foundCount(filteredServices().length)}
                                </span>
                            </div>

                            <Show
                                when={!services.loading}
                                fallback={
                                    <div class="p-8 text-center text-muted-foreground animate-pulse">
                                        {t().catalog.syncing}
                                    </div>
                                }
                            >
                                <Show
                                    when={filteredServices().length > 0}
                                    fallback={
                                        <div class="p-8 text-center text-muted-foreground">
                                            {t().catalog.empty}
                                        </div>
                                    }
                                >
                                    <div class="flex flex-col divide-y divide-border">
                                        <For each={filteredServices()}>
                                            {(item) => (
                                                <div class="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:bg-muted/10">
                                                    <div class="flex flex-col gap-2 min-w-0">
                                                        <div class="flex flex-wrap items-center gap-2.5">
                                                            <span class="font-bold text-base text-foreground">
                                                                {localizeDomain.serviceName(
                                                                    item.name,
                                                                )}
                                                            </span>
                                                            <Show when={item.category}>
                                                                <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                                    {localizeDomain.category(
                                                                        item.category,
                                                                    )}
                                                                </span>
                                                            </Show>
                                                        </div>
                                                        <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                            <span class="flex items-center gap-1.5">
                                                                <ClockIcon />{" "}
                                                                {formatInteger(
                                                                    item.durationMinutes,
                                                                )}{" "}
                                                                {t().common.minutesShort}
                                                            </span>
                                                            <Show
                                                                when={
                                                                    (item.cleanupMinutes ?? 0) > 0
                                                                }
                                                            >
                                                                <span class="flex items-center gap-1.5 opacity-80">
                                                                    {t().catalog.cleanupSuffix(
                                                                        item.cleanupMinutes ?? 0,
                                                                    )}
                                                                </span>
                                                            </Show>
                                                        </div>
                                                    </div>

                                                    <div class="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-border">
                                                        <span
                                                            class="font-bold text-lg text-foreground"
                                                            title={
                                                                formatMoneyHint(item.price) ??
                                                                undefined
                                                            }
                                                        >
                                                            {formatMoney(item.price)}
                                                        </span>

                                                        <div class="flex items-center gap-2 md:border-l border-border md:pl-6">
                                                            <IconButton
                                                                aria-label={t().common.edit}
                                                                onClick={() =>
                                                                    openEditModal(item as any)
                                                                }
                                                            >
                                                                <EditIcon />
                                                            </IconButton>

                                                            <button
                                                                type="button"
                                                                aria-label={t().common.delete}
                                                                onClick={() =>
                                                                    setDeleteTargetId(item.id)
                                                                }
                                                                class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer p-2"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </Show>
                        </div>
                    </Card>
                </div>
            </Show>

            {/* --- MODAL (CREATE / UPDATE) --- */}
            <Modal
                isOpen={isModalOpen()}
                onClose={() => setIsModalOpen(false)}
                title={editingId() ? t().catalog.modalEditTitle : t().catalog.modalNewTitle}
            >
                <div class="flex flex-col gap-5">
                    <Input
                        labelText={t().catalog.nameLabel}
                        placeholder={t().catalog.namePlaceholder}
                        value={formData().name}
                        onInput={(e) =>
                            setFormData((p) => ({ ...p, name: e.currentTarget.value }))
                        }
                        required
                    />

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-sm font-medium text-foreground">
                                {t().catalog.categoryLabel}
                            </label>
                            <select
                                class="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                                value={formData().category}
                                onChange={(e) =>
                                    setFormData((p) => ({
                                        ...p,
                                        category: e.currentTarget.value,
                                    }))
                                }
                            >
                                <For each={SERVICE_CATEGORIES}>
                                    {(cat) => (
                                        <option value={cat}>
                                            {localizeDomain.category(cat)}
                                        </option>
                                    )}
                                </For>
                            </select>
                        </div>

                        <Input
                            labelText={t().catalog.priceLabel(localeStrategy().currency)}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={priceInput()}
                            onInput={(e) => setPriceInput(e.currentTarget.value)}
                        />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            labelText={t().catalog.durationLabel}
                            type="number"
                            min="5"
                            value={formData().durationMinutes.toString()}
                            onInput={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    durationMinutes: parseInt(e.currentTarget.value, 10) || 0,
                                }))
                            }
                        />
                        <Input
                            labelText={t().catalog.cleanupLabel}
                            type="number"
                            min="0"
                            value={(formData().cleanupMinutes ?? 0).toString()}
                            onInput={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    cleanupMinutes: parseInt(e.currentTarget.value, 10) || 0,
                                }))
                            }
                        />
                    </div>

                    <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isSaving() || !formData().name.trim()}
                        >
                            {isSaving() ? t().common.saving : t().catalog.saveService}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!deleteTargetId()}
                onClose={() => setDeleteTargetId(null)}
                title={t().catalog.deleteTitle}
                size="sm"
            >
                <div class="flex flex-col gap-5">
                    <p class="text-sm text-muted-foreground">{t().catalog.deleteConfirm}</p>
                    <div class="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteTargetId(null)}
                            disabled={isSaving()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isSaving()}
                        >
                            {isSaving() ? t().common.wait : t().common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}