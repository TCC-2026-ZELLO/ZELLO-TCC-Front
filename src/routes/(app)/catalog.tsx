import { createSignal, createResource, For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Badge } from "~/components/Widgets/Badge";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
import { Input } from "~/components/Widgets/Input";
import { IconButton } from "~/components/Widgets/IconButton";

import {CatalogItemUI, catalogService} from "~/services/catalog.service";
import { activeBusiness } from "~/store/appState";

import { PlusIcon, EditIcon, TrashIcon, ClockIcon, BriefcaseIcon } from "~/components/Icons/Icons";

export default function CatalogPage() {
    const [activeTab, setActiveTab] = createSignal("servicos");
    const [filter, setFilter] = createSignal("Todos");
    const [search, setSearch] = createSignal("");

    const businessId = () => activeBusiness()?.businessId || false;
    const [services, { refetch }] = createResource(businessId, catalogService.list);

    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const [editingId, setEditingId] = createSignal<string | null>(null);
    const [isSaving, setIsSaving] = createSignal(false);

    const defaultForm: CatalogItemUI = { name: "", category: "Cabelo", price: 0, durationMinutes: 30, cleanupMinutes: 0, active: true };
    const [formData, setFormData] = createSignal<CatalogItemUI>({ ...defaultForm });

    const categories = ["Todos", "Cabelo", "Barba", "Estética", "Unhas"];

    const filteredServices = () => {
        const list = services() || [];
        return list.filter((item: any) => {
            const matchesSearch = item.name.toLowerCase().includes(search().toLowerCase());
            const matchesFilter = filter() === "Todos" || item.category === filter();
            const matchesTab = activeTab() === "servicos" ? !item.isCombo : item.isCombo;
            return matchesSearch && matchesFilter && matchesTab;
        });
    };

    const openAddModal = () => {
        setFormData({ ...defaultForm });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setFormData({
            name: item.name,
            category: item.category || "Cabelo",
            price: item.price,
            durationMinutes: item.durationMinutes,
            cleanupMinutes: item.cleanupMinutes || 0,
            active: item.active
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const bId = businessId();
        if (!bId || !formData().name || formData().price < 0) return;

        setIsSaving(true);
        try {
            if (editingId()) {
                await catalogService.update(editingId() as string, formData());
            } else {
                await catalogService.create(bId as string, formData());
            }
            setIsModalOpen(false);
            refetch();
        } catch (e) {
            alert("Erro ao salvar os dados no backend.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.")) return;
        try {
            await catalogService.delete(id);
            refetch();
        } catch (e) {
            alert("Erro ao excluir serviço.");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        alert("O backend atual não possui o campo 'active' ou 'status' para inativar serviços.");
    };

    return (
        <div class="flex flex-col gap-8 p-8 animate-in fade-in duration-300">
            {/* --- HEADER --- */}
            <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-foreground">Catálogo de Serviços</h1>
                    <p class="text-muted-foreground mt-1">
                        Gerenciando: <span class="font-medium text-foreground">{activeBusiness()?.name || "Carregando..."}</span>
                    </p>
                </div>
                <Button variant="primary" disabled={!businessId()} onClick={openAddModal}>
                    <div class="flex items-center gap-2">
                        <PlusIcon />
                        <span>Novo Serviço</span>
                    </div>
                </Button>
            </header>

            {/* --- RESUMO --- */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div class="flex items-center gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                            <BriefcaseIcon />
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-foreground">{services()?.length || 0}</div>
                            <div class="text-sm text-muted-foreground">Serviços Cadastrados</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div class="flex items-center justify-between h-full">
                        <div class="flex flex-col">
                            <span class="font-bold text-foreground">Disponibilidade Geral</span>
                            <span class="text-sm text-muted-foreground">Abrir ou fechar a agenda da loja</span>
                        </div>
                        <Switch checked={true} label="Loja Aberta" />
                    </div>
                </Card>
            </div>

            {/* --- CONTROLES E FILTROS --- */}
            <div class="flex flex-col gap-6">
                <Tabs
                    activeValue={activeTab()}
                    onChange={(val) => setActiveTab(val)}
                    items={[
                        { label: "Serviços Individuais", value: "servicos" },
                        { label: "Combos / Pacotes", value: "combos" }
                    ]}
                />

                <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div class="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
                        <For each={categories}>
                            {(cat) => (
                                <Button
                                    variant={filter() === cat ? "primary" : "outline"}
                                    size="sm"
                                    onClick={() => setFilter(cat)}
                                >
                                    {cat}
                                </Button>
                            )}
                        </For>
                    </div>

                    <div class="w-full sm:w-72">
                        <Input
                            searchIcon
                            placeholder="Buscar serviço..."
                            value={search()}
                            onInput={(e) => setSearch(e.currentTarget.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- LISTA DE CATÁLOGO --- */}
            <Card>
                <div class="flex flex-col">
                    <div class="px-6 py-4 bg-muted/30 border-b border-border flex justify-between items-center">
                        <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {filteredServices().length} Serviços Encontrados
                        </span>
                    </div>

                    <Show when={!services.loading} fallback={<div class="p-8 text-center text-muted-foreground animate-pulse">Sincronizando com o banco de dados...</div>}>
                        <Show when={filteredServices().length > 0} fallback={<div class="p-8 text-center text-muted-foreground">Nenhum serviço encontrado.</div>}>
                            <div class="flex flex-col divide-y divide-border">
                                <For each={filteredServices()}>
                                    {(item) => (
                                        <div class="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:bg-muted/10">

                                            <div class="flex flex-col gap-2">
                                                <div class="flex items-center gap-3">
                                                    <span class="font-bold text-base text-foreground">{item.name}</span>
                                                    <Show when={!item.active}>
                                                        <Badge variant="error">Inativo</Badge>
                                                    </Show>
                                                </div>
                                                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span class="flex items-center gap-1.5">
                                                        <ClockIcon /> {item.durationMinutes} min
                                                    </span>
                                                    <Show when={item.cleanupMinutes > 0}>
                                                        <span class="flex items-center gap-1.5 opacity-70">
                                                            + {item.cleanupMinutes} min limpeza
                                                        </span>
                                                    </Show>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <span class="font-bold text-lg text-foreground">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                                </span>

                                                <div class="flex items-center gap-2 border-l border-border pl-6">
                                                    <div class="mr-4">
                                                        <Switch
                                                            checked={item.active}
                                                            onChange={() => handleToggleStatus(item.id, item.active)}
                                                        />
                                                    </div>

                                                    <div onClick={() => openEditModal(item)}>
                                                        <IconButton> <EditIcon /> </IconButton>
                                                    </div>

                                                    <div
                                                        onClick={() => handleDelete(item.id)}
                                                        class="text-muted-foreground hover:text-error transition-colors cursor-pointer p-2"
                                                    >
                                                        <TrashIcon />
                                                    </div>
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

            {/* --- MODAL (CREATE / UPDATE) --- */}
            <Show when={isModalOpen()}>
                <Portal>
                    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <Card
                            class="w-full max-w-lg p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200 border-border bg-card">

                            <header class="flex justify-between items-center border-b border-border pb-4">
                                <h2 class="text-xl font-bold text-foreground">
                                    {editingId() ? "Editar Serviço" : "Novo Serviço"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    class="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none text-xl"
                                >
                                    ✕
                                </button>
                            </header>

                            <div class="flex flex-col gap-5 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                                <Input
                                    labelText="Nome do Serviço"
                                    placeholder="Ex: Corte de Cabelo"
                                    value={formData().name}
                                    onInput={(e) => setFormData(p => ({...p, name: e.currentTarget.value}))}
                                />

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Input
                                        labelText="Preço (R$)"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData().price.toString()}
                                        onInput={(e) => setFormData(p => ({
                                            ...p,
                                            price: parseFloat(e.currentTarget.value) || 0
                                        }))}
                                    />
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Input
                                        labelText="Duração (min)"
                                        type="number"
                                        value={formData().durationMinutes.toString()}
                                        onInput={(e) => setFormData(p => ({
                                            ...p,
                                            durationMinutes: parseInt(e.currentTarget.value) || 0
                                        }))}
                                    />
                                    <Input
                                        labelText="Limpeza pós-serviço (min)"
                                        type="number"
                                        value={formData().cleanupMinutes?.toString() || "0"}
                                        onInput={(e) => setFormData(p => ({
                                            ...p,
                                            cleanupMinutes: parseInt(e.currentTarget.value) || 0
                                        }))}
                                    />
                                </div>
                            </div>

                            <footer class="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={handleSave}
                                        disabled={isSaving() || !formData().name}>
                                    {isSaving() ? "Salvando..." : "Salvar Serviço"}
                                </Button>
                            </footer>
                        </Card>
                    </div>
                </Portal>
            </Show>
        </div>
    );
}