import { createSignal, createResource, For, Show, createEffect, batch } from "solid-js";
import { Portal } from "solid-js/web";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { activeBusiness } from "~/store/appState";
import { businessProfessionalsService } from "~/services/business-professionals.service";
import { professionalService } from "~/services/professional.service";
import { catalogService } from "~/services/catalog.service";
import {
    CheckCircleIcon,
    PlusIcon,
    StarIcon,
    SaveIcon,
    BriefcaseIcon,
    ClockIcon, TrashIcon
} from "~/components/Icons/Icons";

export default function ProfessionalsPage() {
    const businessId = () => activeBusiness()?.businessId;

    const [professionals, { refetch }] = createResource(businessId, async (id) => {
        if (!id) return [];
        const res = await businessProfessionalsService.listByBusiness(id);
        return res.data || res;
    });

    const [businessCatalog] = createResource(businessId, async (id) => {
        if (!id) return []
        return await catalogService.list(id);
    });

    const [isAddModalOpen, setIsAddModalOpen] = createSignal(false);
    const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
    const [selectedBP, setSelectedBP] = createSignal<any>(null);
    const [selectedServiceIds, setSelectedServiceIds] = createSignal<string[]>([]);
    const [newProfEmail, setNewProfEmail] = createSignal("");
    const [isSaving, setIsSaving] = createSignal(false);

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const [diasAtivos, setDiasAtivos] = createSignal<string[]>(["Seg", "Ter", "Qua", "Qui", "Sex"]);
    const [horaInicio, setHoraInicio] = createSignal("09:00");
    const [horaFim, setHoraFim] = createSignal("18:00");


    const handleOpenEdit = async (bp: any) => {
        setSelectedBP(bp);

        try {
            const res = await professionalService.getServices(bp.professional.id);
            const currentServices = res.data || res;
            const ids = currentServices.map((item: any) => item.service.id);

            batch(() => {
                setSelectedServiceIds(ids);
                setIsEditModalOpen(true);
            });
        } catch (e) {
            console.error("Erro ao carregar serviços", e);
            batch(() => {
                setSelectedServiceIds([]);
                setIsEditModalOpen(true);
            });
        }
    };

    const toggleService = (id: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleRemoveProfessional = async (bpId: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover ${name} da equipe?`)) return;

        setIsSaving(true);
        try {
            await businessProfessionalsService.remove(bpId);
            refetch();
            alert("Profissional removido com sucesso.");
        } catch (e) {
            alert("Erro ao remover profissional.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEverything = async () => {
        const bp = selectedBP();
        if (!bp) return;

        setIsSaving(true);
        try {
            await businessProfessionalsService.update(bp.id, {
                active: true,
            });

            await businessProfessionalsService.updateServices(bp.id, selectedServiceIds());

            setIsEditModalOpen(false);
            refetch();
            alert("Configurações atualizadas!");
        } catch (e) {
            alert("Erro ao salvar configurações.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProfessional = async () => {
        const bId = businessId();
        if (!bId || !newProfEmail()) return;

        setIsSaving(true);
        try {
            await businessProfessionalsService.create({
                businessId: bId,
                email: newProfEmail(),
                active: true,
            });
            batch(() => {
                setIsAddModalOpen(false);
                setNewProfEmail("");
            });
            refetch();
            alert("Profissional vinculado com sucesso!");
        } catch (e: any) {
            alert("Não foi possível localizar um profissional com este e-mail.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div class="mx-auto flex w-full flex-col gap-8 p-8 animate-in fade-in duration-500">
            {/* --- HEADER --- */}
            <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-foreground font-display tracking-tight">Equipe Zello</h1>
                    <p class="text-sm text-muted-foreground">
                        Gerencie o time de <span class="font-bold text-foreground">{activeBusiness()?.name}</span>
                    </p>
                </div>
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                    <PlusIcon class="mr-2"/> Vincular Profissional
                </Button>
            </header>

            {/* --- LISTAGEM --- */}
            <Show when={!professionals.loading} fallback={<div class="p-12 text-center animate-pulse text-muted-foreground">Carregando time...</div>}>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <For each={professionals()}>
                        {(item) => (
                            <div class="group relative">
                                <Card
                                    onClick={() => handleOpenEdit(item)}
                                    class="flex flex-col p-6 gap-6 cursor-pointer group-hover:border-primary/50 transition-all hover:shadow-md"
                                >
                                    <div class="flex items-start justify-between">
                                        <div class="flex items-center gap-4">
                                            <img
                                                src={item.professional?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.professional?.user?.name)}`}
                                                class="size-14 rounded-2xl object-cover border-2 border-background shadow-sm"
                                            />
                                            <div class="flex flex-col">
                                                <div class="flex items-center gap-1.5 font-bold text-foreground text-lg">
                                                    {item.professional?.user?.name}
                                                </div>
                                                <span class="text-xs text-muted-foreground">{item.professional?.user?.email}</span>
                                                <div class="mt-2 flex gap-2">
                                                    <span class="text-[10px] uppercase font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                        {item.professional?.specialty || 'Especialista'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveProfessional(item.id, item.professional?.user?.name);
                                            }}
                                            class="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                                        >
                                            <TrashIcon size={18}/>
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </For>
                </div>
            </Show>
            {/* --- MODAL: VINCULAR --- */}
            <Show when={isAddModalOpen()}>
                <Portal>
                    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <Card class="w-full max-w-md p-6 flex flex-col gap-6 animate-in zoom-in-95">
                            <h2 class="text-xl font-bold">Vincular Novo Membro</h2>
                            <Input
                                labelText="E-mail do Profissional"
                                placeholder="exemplo@email.com"
                                value={newProfEmail()}
                                onInput={e => setNewProfEmail(e.currentTarget.value)}
                            />
                            <div class="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleAddProfessional} disabled={isSaving()}>
                                    {isSaving() ? "Vinculando..." : "Confirmar Vínculo"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </Portal>
            </Show>

            {/* --- MODAL: CONFIGURAÇÕES (JORNADA + SERVIÇOS) --- */}
            <Show when={isEditModalOpen()}>
                <Portal>
                    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <Card class="w-full max-w-2xl p-8 flex flex-col gap-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">

                            <header class="flex justify-between items-center border-b pb-4">
                                <div class="flex items-center gap-4">
                                    <img src={selectedBP()?.professional?.photoUrl || `https://ui-avatars.com/api/?name=${selectedBP()?.professional?.user?.name}`}
                                         class="size-12 rounded-xl object-cover bg-muted" />
                                    <div>
                                        <h2 class="text-xl font-bold">{selectedBP()?.professional?.user?.name}</h2>
                                        <p class="text-xs text-muted-foreground">Gestão de competências e horários</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} class="text-xl hover:text-primary">✕</button>
                            </header>

                            {/* JORNADA */}
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center gap-2 text-primary">
                                    <ClockIcon size={18}/>
                                    <h3 class="font-bold uppercase tracking-widest text-[10px]">Escala de Atendimento</h3>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <For each={diasSemana}>
                                        {(dia) => (
                                            <button
                                                onClick={() => setDiasAtivos(p => p.includes(dia) ? p.filter(d => d !== dia) : [...p, dia])}
                                                class={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                    diasAtivos().includes(dia) ? 'bg-primary text-white border-primary shadow-sm' : 'border-border text-muted-foreground'
                                                }`}
                                            >
                                                {dia}
                                            </button>
                                        )}
                                    </For>
                                </div>
                            </div>

                            {/* COMPETÊNCIAS */}
                            <div class="flex flex-col gap-4 border-t pt-6">
                                <div class="flex items-center gap-2 text-primary">
                                    <BriefcaseIcon size={18}/>
                                    <h3 class="font-bold uppercase tracking-widest text-[10px]">Serviços Habilitados</h3>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <For each={businessCatalog()}>
                                        {(service) => (
                                            <div
                                                onClick={() => toggleService(service.id)}
                                                class={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                                    selectedServiceIds().includes(service.id) ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:bg-muted/50'
                                                }`}
                                            >
                                                <div class="flex justify-between items-center">
                                                    <div>
                                                        <p class="text-sm font-bold">{service.name}</p>
                                                        <p class="text-[10px] text-muted-foreground">{service.durationMinutes} min · R$ {service.price}</p>
                                                    </div>
                                                    <div class={`size-5 rounded-full border-2 flex items-center justify-center ${
                                                        selectedServiceIds().includes(service.id) ? 'bg-primary border-primary' : 'border-border'
                                                    }`}>
                                                        <Show when={selectedServiceIds().includes(service.id)}>
                                                            <div class="size-1.5 bg-white rounded-full"></div>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </div>

                            <footer class="flex gap-4 pt-6 border-t mt-auto">
                                <Button variant="ghost" class="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                                <Button variant="primary" class="flex-1" onClick={handleSaveEverything} disabled={isSaving()}>
                                    <SaveIcon class="mr-2"/> {isSaving() ? "Salvando..." : "Salvar Configurações"}
                                </Button>
                            </footer>
                        </Card>
                    </div>
                </Portal>
            </Show>
        </div>
    );
}


