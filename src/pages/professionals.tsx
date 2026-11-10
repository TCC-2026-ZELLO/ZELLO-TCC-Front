import { batch, createResource, createSignal, For, Show } from "solid-js";
import {
    BriefcaseIcon,
    ClockIcon,
    PlusIcon,
    SaveIcon,
    TrashIcon,
} from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { Input } from "../components/Widgets/Input";
import { Modal } from "../components/Widgets/Modal";
import type { TeamMemberLink } from "../core/domain/entities/models";
import {
    formatInteger,
    formatMoney,
    formatMoneyHint,
    localizeDomain,
    t,
} from "../core/i18n";
import { businessProfessionalsService } from "../services/business-professionals.service";
import { catalogService } from "../services/catalog.service";
import { professionalService } from "../services/professional.service";
import { activeBusiness } from "../store/appState";
import { toast } from "../store/toastStore";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export default function ProfessionalsPage() {
    const businessId = () => activeBusiness()?.businessId;

    const [professionals, { refetch }] = createResource(businessId, async (id) => {
        if (!id) return [];
        return await businessProfessionalsService.listByBusiness(id);
    });

    const [businessCatalog] = createResource(businessId, async (id) => {
        if (!id) return [];
        return await catalogService.list(id);
    });

    const [isAddModalOpen, setIsAddModalOpen] = createSignal(false);
    const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
    const [selectedBP, setSelectedBP] = createSignal<TeamMemberLink | null>(null);
    const [unlinkTarget, setUnlinkTarget] = createSignal<TeamMemberLink | null>(null);
    const [selectedServiceIds, setSelectedServiceIds] = createSignal<string[]>([]);
    const [newProfEmail, setNewProfEmail] = createSignal("");
    const [isSaving, setIsSaving] = createSignal(false);

    const [activeDays, setActiveDays] = createSignal<number[]>([1, 2, 3, 4, 5]);
    const [horaInicio, setHoraInicio] = createSignal("09:00");
    const [horaFim, setHoraFim] = createSignal("18:00");

    const handleOpenEdit = async (bp: TeamMemberLink) => {
        setSelectedBP(bp);

        try {
            const profId = bp.professional?.id || bp.professionalId;
            const [servicesList, shifts] = await Promise.all([
                profId ? professionalService.getServices(profId) : Promise.resolve([]),
                businessProfessionalsService.findShifts(bp.id),
            ]);

            const serviceIds = (servicesList || [])
                .map((item: any) => item?.service?.id ?? item?.id)
                .filter(Boolean);

            const shiftDays = (shifts || []).map((s) => Number(s.dayOfWeek));

            batch(() => {
                setSelectedServiceIds(serviceIds);
                setActiveDays(shiftDays.length > 0 ? shiftDays : [1, 2, 3, 4, 5]);
                if (shifts && shifts.length > 0) {
                    setHoraInicio(shifts[0].startTime.substring(0, 5));
                    setHoraFim(shifts[0].endTime.substring(0, 5));
                } else {
                    setHoraInicio("09:00");
                    setHoraFim("18:00");
                }
                setIsEditModalOpen(true);
            });
        } catch {
            setIsEditModalOpen(true);
        }
    };

    const toggleService = (id: string) => {
        setSelectedServiceIds((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        );
    };

    const toggleDay = (dayId: number) => {
        setActiveDays((prev) =>
            prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
        );
    };

    const confirmRemoveProfessional = async () => {
        const target = unlinkTarget();
        if (!target) return;

        setIsSaving(true);
        try {
            await businessProfessionalsService.remove(target.id);
            setUnlinkTarget(null);
            await refetch();
            toast.success(t().professionals.toasts.unlinked);
        } catch {
            toast.error(t().professionals.toasts.unlinkError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEverything = async () => {
        const bp = selectedBP();
        if (!bp) return;

        setIsSaving(true);
        try {
            await businessProfessionalsService.updateServices(bp.id, selectedServiceIds());

            const shiftPayload = activeDays().map((dayOfWeek) => ({
                dayOfWeek,
                startTime: horaInicio(),
                endTime: horaFim(),
            }));

            await businessProfessionalsService.updateShifts(bp.id, shiftPayload);

            setIsEditModalOpen(false);
            await refetch();
            toast.success(t().professionals.toasts.saved);
        } catch {
            toast.error(t().professionals.toasts.saveError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProfessional = async () => {
        const bId = businessId();
        if (!bId || !newProfEmail().trim()) return;

        setIsSaving(true);
        try {
            await businessProfessionalsService.create({
                businessId: bId,
                email: newProfEmail().trim(),
                active: true,
            });
            batch(() => {
                setIsAddModalOpen(false);
                setNewProfEmail("");
            });
            await refetch();
            toast.success(t().professionals.toasts.invited);
        } catch {
            toast.error(t().professionals.toasts.inviteError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div class="mx-auto flex w-full flex-col gap-6 sm:gap-8 p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
            {/* --- HEADER --- */}
            <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold text-foreground font-display tracking-tight">
                        {t().professionals.title}
                    </h1>
                    <p class="text-sm text-muted-foreground mt-1">
                        {t().professionals.subtitle}
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={!businessId()}
                    class="w-full sm:w-auto"
                >
                    <PlusIcon class="mr-2" /> {t().professionals.inviteButton}
                </Button>
            </header>

            {/* --- LISTAGEM --- */}
            <Show
                when={!professionals.loading}
                fallback={
                    <div class="p-12 text-center animate-pulse text-muted-foreground">
                        {t().common.loading}
                    </div>
                }
            >
                <Show
                    when={(professionals() ?? []).length > 0}
                    fallback={
                        <Card class="p-10 text-center flex flex-col items-center gap-3 border-dashed">
                            <div class="size-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                                <BriefcaseIcon size={24} />
                            </div>
                            <h2 class="text-lg font-bold text-foreground">
                                {t().professionals.emptyTitle}
                            </h2>
                            <p class="text-sm text-muted-foreground max-w-md">
                                {t().professionals.emptyDesc}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                class="mt-2"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <PlusIcon class="mr-1.5" size={16} />
                                {t().professionals.inviteButton}
                            </Button>
                        </Card>
                    }
                >
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <For each={professionals()}>
                            {(item) => {
                                const profName =
                                    item.professional?.user?.name || "Profissional";
                                return (
                                    <Card
                                        onClick={() => handleOpenEdit(item)}
                                        class="flex flex-col p-5 sm:p-6 gap-4 cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                                    >
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="flex items-center gap-4 min-w-0">
                                                <img
                                                    src={
                                                        item.professional?.photoUrl ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profName)}`
                                                    }
                                                    alt={profName}
                                                    class="size-14 shrink-0 rounded-2xl object-cover border-2 border-background shadow-sm bg-muted"
                                                />
                                                <div class="flex flex-col min-w-0">
                                                    <div class="font-bold text-foreground text-base sm:text-lg truncate">
                                                        {profName}
                                                    </div>
                                                    <span class="text-xs text-muted-foreground truncate">
                                                        {item.professional?.user?.email}
                                                    </span>
                                                    <div class="mt-2 flex flex-wrap gap-2">
                                                        <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                                                            {localizeDomain.specialty(
                                                                item.professional?.specialty ||
                                                                    "Especialista",
                                                            )}
                                                        </span>
                                                        <span class="text-[10px] uppercase font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                                                            {t().professionals.editShiftsServices}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                aria-label={t().professionals.unlinkTitle}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUnlinkTarget(item);
                                                }}
                                                class="p-2 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg cursor-pointer"
                                            >
                                                <TrashIcon size={18} />
                                            </button>
                                        </div>
                                    </Card>
                                );
                            }}
                        </For>
                    </div>
                </Show>
            </Show>

            {/* --- MODAL: VINCULAR --- */}
            <Modal
                isOpen={isAddModalOpen()}
                onClose={() => setIsAddModalOpen(false)}
                title={t().professionals.inviteModalTitle}
                size="md"
            >
                <div class="flex flex-col gap-5">
                    <Input
                        labelText={t().professionals.inviteEmailLabel}
                        type="email"
                        placeholder={t().professionals.inviteEmailPlaceholder}
                        value={newProfEmail()}
                        onInput={(e) => setNewProfEmail(e.currentTarget.value)}
                    />
                    <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddProfessional}
                            disabled={isSaving() || !newProfEmail().trim()}
                        >
                            {isSaving()
                                ? t().professionals.sending
                                : t().professionals.sendInvite}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isEditModalOpen()}
                onClose={() => setIsEditModalOpen(false)}
                title={t().professionals.configModalTitle(
                    selectedBP()?.professional?.user?.name || "",
                )}
                size="xl"
            >
                <div class="flex flex-col gap-6">
                    {/* JORNADA */}
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-2 text-primary">
                            <ClockIcon size={18} />
                            <h3 class="font-bold uppercase tracking-widest text-xs">
                                {t().professionals.shiftsTitle}
                            </h3>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <For each={WEEKDAY_ORDER}>
                                {(dayId) => {
                                    const isActive = () => activeDays().includes(dayId);
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => toggleDay(dayId)}
                                            class={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                isActive()
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                        >
                                            {localizeDomain.dayShort(dayId)}
                                        </button>
                                    );
                                }}
                            </For>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                labelText={t().professionals.startLabel}
                                type="time"
                                value={horaInicio()}
                                onInput={(e) => setHoraInicio(e.currentTarget.value)}
                            />
                            <Input
                                labelText={t().professionals.endLabel}
                                type="time"
                                value={horaFim()}
                                onInput={(e) => setHoraFim(e.currentTarget.value)}
                            />
                        </div>
                    </div>

                    {/* COMPETÊNCIAS */}
                    <div class="flex flex-col gap-4 border-t border-border pt-6">
                        <div class="flex items-center gap-2 text-primary">
                            <BriefcaseIcon size={18} />
                            <h3 class="font-bold uppercase tracking-widest text-xs">
                                {t().professionals.servicesTitle}
                            </h3>
                        </div>

                        <Show
                            when={(businessCatalog() ?? []).length > 0}
                            fallback={
                                <p class="text-sm text-muted-foreground py-4">
                                    {t().professionals.noCatalogServices}
                                </p>
                            }
                        >
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <For each={businessCatalog()}>
                                    {(service) => {
                                        const isSelected = () =>
                                            selectedServiceIds().includes(service.id);
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => toggleService(service.id)}
                                                class={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                                                    isSelected()
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                        : "border-border hover:bg-muted/50"
                                                }`}
                                            >
                                                <div class="flex justify-between items-center gap-3">
                                                    <div class="min-w-0">
                                                        <p class="text-sm font-bold text-foreground truncate">
                                                            {localizeDomain.serviceName(
                                                                service.name,
                                                            )}
                                                        </p>
                                                        <p
                                                            class="text-xs text-muted-foreground"
                                                            title={
                                                                formatMoneyHint(service.price) ??
                                                                undefined
                                                            }
                                                        >
                                                            {formatInteger(
                                                                service.durationMinutes,
                                                            )}{" "}
                                                            {t().common.minutesShort} ·{" "}
                                                            {formatMoney(service.price)}
                                                        </p>
                                                    </div>
                                                    <div
                                                        class={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                                            isSelected()
                                                                ? "bg-primary border-primary"
                                                                : "border-border"
                                                        }`}
                                                    >
                                                        <Show when={isSelected()}>
                                                            <div class="size-2 bg-primary-foreground rounded-full" />
                                                        </Show>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    }}
                                </For>
                            </div>
                        </Show>
                    </div>

                    <footer class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
                        <Button
                            variant="ghost"
                            class="flex-1"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            onClick={handleSaveEverything}
                            disabled={isSaving()}
                        >
                            <SaveIcon class="mr-2" />{" "}
                            {isSaving() ? t().common.saving : t().professionals.saveConfig}
                        </Button>
                    </footer>
                </div>
            </Modal>

            <Modal
                isOpen={!!unlinkTarget()}
                onClose={() => setUnlinkTarget(null)}
                title={t().professionals.unlinkTitle}
                size="sm"
            >
                <div class="flex flex-col gap-5">
                    <p class="text-sm text-muted-foreground">
                        {t().professionals.unlinkConfirm}
                    </p>
                    <div class="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setUnlinkTarget(null)}
                            disabled={isSaving()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmRemoveProfessional}
                            disabled={isSaving()}
                        >
                            {isSaving() ? t().common.wait : t().common.confirm}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}