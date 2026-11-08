import { batch, createEffect, createResource, createSignal, For, Show } from "solid-js";
import {
    CameraIcon,
    EditIcon,
    PlusIcon,
    RibbonIcon,
    SaveIcon,
    TrashIcon,
} from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { Input } from "../components/Widgets/Input";
import { Modal } from "../components/Widgets/Modal";
import { ReviewManageCard } from "../components/Widgets/ReviewManageCard";
import { Switch } from "../components/Widgets/Switch";
import { Tabs } from "../components/Widgets/Tabs";
import type { Qualification } from "../core/domain/entities/models";
import { formatPercent, localizeDomain, t } from "../core/i18n";
import { professionalService } from "../services/professional.service";
import { getMyReceivedReviews } from "../services/reviews.service";
import { getProId } from "../store/appState";
import { toast } from "../store/toastStore";

const QUALIFICATION_TYPE_KEYS = [
    "certification",
    "diploma",
    "specialization",
    "course",
] as const;

const TYPE_COLORS: Record<string, string> = {
    diploma: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    specialization: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    course: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    certification: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 5;

function validateQualificationFile(file: File): string | null {
    if (!ALLOWED_MIME.includes(file.type)) {
        return t().professionalSettings.invalidFileType;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return t().professionalSettings.fileTooLarge;
    }
    return null;
}

function isPdf(url?: string) {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf") || url.includes("application/pdf");
}

function FileDropzone(props: {
    file: File | null;
    error: string;
    onFile: (f: File) => void;
    onError: (e: string) => void;
    optional?: boolean;
    currentUrl?: string;
}) {
    const handleChange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const err = validateQualificationFile(file);
        if (err) {
            props.onError(err);
            return;
        }
        props.onError("");
        props.onFile(file);
    };

    return (
        <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase text-muted-foreground">
                {t().professionalSettings.certFileLabel}
                <Show when={!props.optional}>
                    <span class="text-destructive ml-1">*</span>
                </Show>
            </span>
            <Show when={props.optional}>
                <span class="text-xs text-muted-foreground">
                    {t().professionalSettings.keepCurrentFileHint}
                </span>
            </Show>
            <label
                class={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-all
                    ${props.file ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-secondary"}
                    ${props.error ? "border-destructive" : ""}`}
            >
                <Show
                    when={props.file}
                    fallback={
                        <Show
                            when={props.currentUrl}
                            fallback={
                                <>
                                    <RibbonIcon size={22} class="text-muted-foreground" />
                                    <span class="text-sm text-muted-foreground">
                                        {t().professionalSettings.dropzoneHint}
                                    </span>
                                    <span class="text-xs text-muted-foreground">
                                        {t().professionalSettings.dropzoneFormats}
                                    </span>
                                </>
                            }
                        >
                            <span class="text-sm font-semibold text-primary truncate max-w-full px-2">
                                {isPdf(props.currentUrl) ? "PDF" : t().professionalSettings.viewCertificate}
                            </span>
                            <span class="text-xs text-muted-foreground">
                                {t().professionalSettings.dropzoneHint}
                            </span>
                        </Show>
                    }
                >
                    <span class="text-sm font-semibold text-primary truncate max-w-full px-2">
                        ✓ {props.file!.name}
                    </span>
                    <span class="text-xs text-muted-foreground">
                        {t().professionalSettings.dropzoneHint}
                    </span>
                </Show>
                <input
                    type="file"
                    hidden
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleChange}
                />
            </label>
            <Show when={props.error}>
                <span class="text-xs text-destructive">{props.error}</span>
            </Show>
        </div>
    );
}

export default function ProfessionalSettings() {
    const [activeTab, setActiveTab] = createSignal("perfil");

    let avatarInput: HTMLInputElement | undefined;
    let bannerInput: HTMLInputElement | undefined;
    let portfolioInput: HTMLInputElement | undefined;

    const [profile, { refetch: refetchProfile }] = createResource(
        getProId,
        professionalService.getPublicProfile,
    );
    const [portfolio, { refetch: refetchPortfolio }] = createResource(
        getProId,
        professionalService.getPortfolio,
    );
    const [qualifications, { refetch: refetchQualifications }] = createResource(
        getProId,
        professionalService.getQualifications,
    );
    const [receivedReviews, { refetch: refetchReceivedReviews }] = createResource(
        getProId,
        getMyReceivedReviews,
    );

    const [isPublic, setIsPublic] = createSignal(false);
    const [nome, setNome] = createSignal("");
    const [especialidade, setEspecialidade] = createSignal("");
    const [bio, setBio] = createSignal("");
    const [loading, setLoading] = createSignal(false);

    createEffect(() => {
        const p = profile();
        if (p) {
            batch(() => {
                setIsPublic(p.visibilityStatus ?? false);
                setNome(p.user?.name || "");
                setEspecialidade(p.specialty || "");
                setBio(p.biography || "");
            });
        }
    });

    const [showAddModal, setShowAddModal] = createSignal(false);
    const [addFile, setAddFile] = createSignal<File | null>(null);
    const [addFileError, setAddFileError] = createSignal("");
    const [addTitle, setAddTitle] = createSignal("");
    const [addInstitution, setAddInstitution] = createSignal("");
    const [addApprovement, setAddApprovement] = createSignal(0);
    const [addType, setAddType] = createSignal("certification");
    const [addYear, setAddYear] = createSignal("");
    const [addSubmitting, setAddSubmitting] = createSignal(false);

    const resetAddModal = () => {
        setAddFile(null);
        setAddFileError("");
        setAddTitle("");
        setAddInstitution("");
        setAddApprovement(0);
        setAddType("certification");
        setAddYear("");
    };

    const handleAdd = async () => {
        if (!addFile()) {
            setAddFileError(t().validation.requiredField);
            return;
        }
        if (!addTitle().trim()) return;
        setAddSubmitting(true);
        try {
            await professionalService.addQualification({
                file: addFile()!,
                title: addTitle().trim(),
                institution: addInstitution().trim() || undefined,
                approvement: addApprovement() || 0,
                type: addType(),
                year: addYear() ? Number(addYear()) : undefined,
            });
            await refetchQualifications();
            setShowAddModal(false);
            resetAddModal();
            toast.success(t().professionalSettings.toasts.qualAdded);
        } catch (err: any) {
            const rawMsg = err?.message || err?.response?.data?.message;
            const text = localizeDomain.apiError(
                typeof rawMsg === "string" ? rawMsg : Array.isArray(rawMsg) ? rawMsg[0] : "",
                t().professionalSettings.toasts.genericError,
            );
            setAddFileError(text);
            toast.error(text);
        } finally {
            setAddSubmitting(false);
        }
    };

    const [editTarget, setEditTarget] = createSignal<Qualification | null>(null);
    const [editFile, setEditFile] = createSignal<File | null>(null);
    const [editFileError, setEditFileError] = createSignal("");
    const [editTitle, setEditTitle] = createSignal("");
    const [editInstitution, setEditInstitution] = createSignal("");
    const [editApprovement, setEditApprovement] = createSignal(0);
    const [editType, setEditType] = createSignal("certification");
    const [editYear, setEditYear] = createSignal("");
    const [editSubmitting, setEditSubmitting] = createSignal(false);

    const openEditModal = (q: Qualification) => {
        setEditTarget(q);
        setEditTitle(q.title ?? "");
        setEditInstitution(q.institution ?? "");
        setEditApprovement(Number(q.approvement) || 0);
        setEditType(q.type ?? "certification");
        setEditYear(q.year ? String(q.year) : "");
        setEditFile(null);
        setEditFileError("");
    };

    const handleEdit = async () => {
        const target = editTarget();
        if (!target || !editTitle().trim()) return;
        setEditSubmitting(true);
        try {
            await professionalService.updateQualification(target.id, {
                file: editFile() ?? undefined,
                title: editTitle().trim(),
                institution: editInstitution().trim() || undefined,
                approvement: editApprovement() || 0,
                type: editType(),
                year: editYear() ? Number(editYear()) : undefined,
            });
            await refetchQualifications();
            setEditTarget(null);
            toast.success(t().professionalSettings.toasts.qualUpdated);
        } catch (err: any) {
            const rawMsg = err?.message || err?.response?.data?.message;
            const text = localizeDomain.apiError(
                typeof rawMsg === "string" ? rawMsg : Array.isArray(rawMsg) ? rawMsg[0] : "",
                t().professionalSettings.toasts.genericError,
            );
            setEditFileError(text);
            toast.error(text);
        } finally {
            setEditSubmitting(false);
        }
    };

    const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
    const [deleteQualId, setDeleteQualId] = createSignal<string | null>(null);
    const [deletePortfolioId, setDeletePortfolioId] = createSignal<string | null>(null);

    const confirmDeleteQualification = async () => {
        const id = deleteQualId();
        if (!id) return;
        setLoading(true);
        try {
            await professionalService.deleteQualification(id);
            setDeleteQualId(null);
            await refetchQualifications();
            toast.success(t().professionalSettings.toasts.qualRemoved);
        } catch {
            toast.error(t().professionalSettings.toasts.genericError);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await professionalService.updateProfile({
                bio: bio(),
                visibilityStatus: isPublic(),
                specialty: especialidade(),
            });
            toast.success(t().professionalSettings.toasts.profileSaved);
            await refetchProfile();
        } catch {
            toast.error(t().professionalSettings.toasts.profileError);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (
        type: "avatar" | "banner" | "portfolio",
        e: Event,
    ) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            if (type === "avatar") await professionalService.updateAvatar(file);
            if (type === "banner") await professionalService.updateBanner(file);
            if (type === "portfolio") await professionalService.uploadPortfolio(file);
            if (type === "portfolio") {
                await refetchPortfolio();
            } else {
                await refetchProfile();
            }
            toast.success(
                type === "portfolio"
                    ? t().professionalSettings.toasts.portfolioAdded
                    : t().professionalSettings.toasts.photoUpdated,
            );
        } catch {
            toast.error(t().professionalSettings.toasts.photoError);
        } finally {
            setLoading(false);
            target.value = "";
        }
    };

    const confirmDeletePortfolioImage = async () => {
        const imageId = deletePortfolioId();
        if (!imageId) return;
        setLoading(true);
        try {
            await professionalService.deletePortfolioImage(imageId);
            setDeletePortfolioId(null);
            await refetchPortfolio();
            toast.success(t().professionalSettings.toasts.portfolioRemoved);
        } catch {
            toast.error(t().professionalSettings.toasts.genericError);
        } finally {
            setLoading(false);
        }
    };

    const QualificationForm = (p: {
        file: File | null;
        fileError: string;
        onFile: (f: File) => void;
        onFileError: (e: string) => void;
        title: string;
        onTitle: (v: string) => void;
        institution: string;
        onInstitution: (v: string) => void;
        approvement: number;
        onApprovement: (v: number) => void;
        type: string;
        onType: (v: string) => void;
        year: string;
        onYear: (v: string) => void;
        currentUrl?: string;
        optional?: boolean;
    }) => (
        <div class="flex flex-col gap-4">
            <FileDropzone
                file={p.file}
                error={p.fileError}
                onFile={p.onFile}
                onError={p.onFileError}
                optional={p.optional}
                currentUrl={p.currentUrl}
            />
            <Input
                labelText={t().professionalSettings.qualTitleLabel}
                placeholder={t().professionalSettings.qualTitlePlaceholder}
                value={p.title}
                onInput={(e) => p.onTitle(e.currentTarget.value)}
                required
            />
            <Input
                labelText={t().professionalSettings.institutionLabel}
                placeholder={t().professionalSettings.institutionPlaceholder}
                value={p.institution}
                onInput={(e) => p.onInstitution(e.currentTarget.value)}
            />

            <Input
                labelText={t().professionalSettings.approvementLabel}
                type="number"
                min="0"
                max="100"
                placeholder="95"
                value={String(p.approvement || "")}
                onInput={(e) => p.onApprovement(Number(e.currentTarget.value) || 0)}
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                    <span class="text-sm font-medium text-foreground">
                        {t().professionalSettings.qualTypeLabel}
                    </span>
                    <select
                        class="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                        value={p.type}
                        onChange={(e) => p.onType(e.currentTarget.value)}
                    >
                        <For each={QUALIFICATION_TYPE_KEYS}>
                            {(typeKey) => (
                                <option value={typeKey}>
                                    {localizeDomain.qualificationType(typeKey)}
                                </option>
                            )}
                        </For>
                    </select>
                </div>
                <Input
                    labelText={t().professionalSettings.yearLabel}
                    type="number"
                    placeholder={String(new Date().getFullYear())}
                    value={p.year}
                    onInput={(e) => p.onYear(e.currentTarget.value)}
                />
            </div>
        </div>
    );

    return (
        <div class="mx-auto flex max-w-4xl flex-col gap-6 sm:gap-8 px-4 py-6 sm:py-8 pb-20 md:py-12 animate-in fade-in duration-300">
            <header class="flex flex-col gap-1">
                <h1 class="text-2xl sm:text-3xl font-bold text-foreground">
                    {t().professionalSettings.title}
                </h1>
                <p class="text-sm sm:text-base text-muted-foreground">
                    {t().professionalSettings.subtitle}
                </p>
            </header>

            <Tabs
                activeValue={activeTab()}
                onChange={(v) => setActiveTab(v as string)}
                items={[
                    { label: t().professionalSettings.tabs.profile, value: "perfil" },
                    { label: t().professionalSettings.tabs.portfolio, value: "portfolio" },
                    {
                        label: t().professionalSettings.tabs.qualifications,
                        value: "certificados",
                    },
                    { label: t().professionalSettings.tabs.reviews, value: "avaliacoes" },
                ]}
            />

            {/* ── ABA PERFIL ──────────────────────────────────────────────── */}
            <Show when={activeTab() === "perfil"}>
                <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card class="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-l-4 border-l-primary">
                        <div class="flex flex-col">
                            <span class="font-bold text-foreground">
                                {t().professionalSettings.visibleProfile}
                            </span>
                            <span class="text-sm text-muted-foreground">
                                {t().professionalSettings.visibleProfileDesc}
                            </span>
                        </div>
                        <Switch
                            checked={isPublic()}
                            onChange={(e) => setIsPublic(e.currentTarget.checked)}
                        />
                    </Card>

                    <Card class="p-0 overflow-hidden flex flex-col">
                        <div
                            class="h-40 sm:h-48 bg-muted relative group cursor-pointer overflow-hidden"
                            onClick={() => bannerInput?.click()}
                            title={t().professionalSettings.bannerLabel}
                        >
                            <Show
                                when={profile()?.bannerUrl}
                                fallback={
                                    <div class="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground text-sm font-medium px-4 text-center">
                                        {t().professionalSettings.bannerLabel}
                                    </div>
                                }
                            >
                                <img
                                    src={profile()?.bannerUrl}
                                    alt={t().professionalSettings.bannerLabel}
                                    class="w-full h-full object-cover"
                                />
                            </Show>
                            <div class="absolute bottom-3 right-3 sm:inset-0 sm:bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                <span class="p-2.5 rounded-full bg-black/65 sm:bg-transparent text-white flex items-center gap-2">
                                    <CameraIcon size={22} />
                                    <span class="hidden sm:inline text-xs font-bold">
                                        {t().professionalSettings.bannerLabel}
                                    </span>
                                </span>
                            </div>
                            <input
                                type="file"
                                hidden
                                ref={bannerInput}
                                accept="image/*"
                                onChange={(e) => handleImageUpload("banner", e)}
                            />
                        </div>

                        <div class="px-5 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-6 relative">
                            <div
                                class="relative group size-24 sm:size-28 -mt-12 sm:-mt-14 cursor-pointer"
                                onClick={() => avatarInput?.click()}
                                title={t().professionalSettings.avatarLabel}
                            >
                                <img
                                    src={
                                        profile()?.photoUrl ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(nome() || "P")}`
                                    }
                                    alt={t().professionalSettings.avatarLabel}
                                    class="size-full rounded-2xl object-cover border-4 border-card shadow-xl bg-muted"
                                />
                                <div class="absolute bottom-1 right-1 sm:inset-0 sm:rounded-2xl sm:bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span class="p-1.5 rounded-full bg-black/65 sm:bg-transparent text-white">
                                        <CameraIcon size={18} />
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    hidden
                                    ref={avatarInput}
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload("avatar", e)}
                                />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <Input
                                    labelText={t().settings.profile.nameLabel}
                                    value={nome()}
                                    disabled={true}
                                />
                                <Input
                                    labelText={t().professionalSettings.specialtyLabel}
                                    value={especialidade()}
                                    placeholder={
                                        t().professionalSettings.specialtyPlaceholder
                                    }
                                    onInput={(e) => setEspecialidade(e.currentTarget.value)}
                                    required
                                />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-foreground">
                                    {t().professionalSettings.bioLabel}
                                </label>
                                <textarea
                                    class="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={bio()}
                                    onInput={(e) => setBio(e.currentTarget.value)}
                                    placeholder={t().professionalSettings.bioPlaceholder}
                                />
                            </div>

                            <Button
                                variant="primary"
                                class="py-3.5"
                                onClick={handleSaveProfile}
                                disabled={loading()}
                            >
                                <Show
                                    when={loading()}
                                    fallback={
                                        <>
                                            <SaveIcon class="mr-2" />{" "}
                                            {t().professionalSettings.saveChanges}
                                        </>
                                    }
                                >
                                    {t().common.saving}
                                </Show>
                            </Button>
                        </div>
                    </Card>
                </div>
            </Show>

            {/* ── ABA PORTFÓLIO ────────────────────────────────────────────── */}
            <Show when={activeTab() === "portfolio"}>
                <Card class="p-5 sm:p-8 flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4">
                    <header>
                        <h2 class="text-xl font-bold text-foreground">
                            {t().professionalSettings.portfolioTitle}
                        </h2>
                        <p class="text-sm text-muted-foreground">
                            {t().professionalSettings.portfolioDesc}
                        </p>
                    </header>

                    <Show when={(portfolio() ?? []).length === 0}>
                        <p class="text-sm text-muted-foreground">
                            {t().professionalSettings.emptyPortfolio}
                        </p>
                    </Show>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <For each={portfolio()}>
                            {(item) => (
                                <div class="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
                                    <img
                                        src={item.url}
                                        alt={t().professionalSettings.portfolioTitle}
                                        class="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div class="absolute top-2 right-2 sm:inset-0 flex items-center justify-center sm:bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            aria-label={
                                                t().professionalSettings.deletePortfolioTitle
                                            }
                                            onClick={() => setDeletePortfolioId(item.id)}
                                            class="p-2 bg-destructive text-destructive-foreground rounded-full shadow-md hover:opacity-90 transition-all cursor-pointer"
                                        >
                                            <TrashIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </For>
                        <input
                            type="file"
                            hidden
                            ref={portfolioInput}
                            accept="image/*"
                            onChange={(e) => handleImageUpload("portfolio", e)}
                        />
                        <button
                            type="button"
                            onClick={() => portfolioInput?.click()}
                            class="aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl hover:bg-secondary/50 hover:border-primary transition-all cursor-pointer group text-foreground"
                        >
                            <div class="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <PlusIcon size={24} />
                            </div>
                            <span class="text-sm font-medium">{t().common.add}</span>
                        </button>
                    </div>
                </Card>
            </Show>

            {/* ── ABA CERTIFICAÇÕES ────────────────────────────────────────── */}
            <Show when={activeTab() === "certificados"}>
                <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card class="p-5 sm:p-8 flex flex-col gap-6">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 class="text-xl font-bold text-foreground">
                                    {t().professionalSettings.qualificationsTitle}
                                </h2>
                                <p class="text-sm text-muted-foreground">
                                    {t().professionalSettings.qualificationsDesc}
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    resetAddModal();
                                    setShowAddModal(true);
                                }}
                                class="flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <PlusIcon size={16} />{" "}
                                {t().professionalSettings.addQualification}
                            </Button>
                        </div>

                        <Show
                            when={!qualifications.loading}
                            fallback={
                                <p class="text-center text-sm text-muted-foreground py-8">
                                    {t().common.loading}
                                </p>
                            }
                        >
                            <Show
                                when={(qualifications() ?? []).length > 0}
                                fallback={
                                    <div class="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-14 px-4 text-center text-muted-foreground">
                                        <RibbonIcon size={40} class="opacity-30" />
                                        <p class="text-sm font-medium">
                                            {t().professionalSettings.emptyQualifications}
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                resetAddModal();
                                                setShowAddModal(true);
                                            }}
                                            class="flex items-center gap-2 text-sm"
                                        >
                                            <PlusIcon size={14} />{" "}
                                            {t().professionalSettings.addQualification}
                                        </Button>
                                    </div>
                                }
                            >
                                <div class="flex flex-col gap-3">
                                    <For each={qualifications()}>
                                        {(q) => (
                                            <div class="group flex items-start sm:items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                                                {/* Thumbnail clicável → preview */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        q.certificateUrl &&
                                                        setPreviewUrl(q.certificateUrl)
                                                    }
                                                    class="shrink-0 size-14 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                                    title={
                                                        t().professionalSettings
                                                            .viewCertificate
                                                    }
                                                >
                                                    <Show
                                                        when={!isPdf(q.certificateUrl)}
                                                        fallback={
                                                            <div class="flex flex-col items-center justify-center text-muted-foreground gap-0.5">
                                                                <RibbonIcon size={18} />
                                                                <span class="text-[10px] font-bold">
                                                                    PDF
                                                                </span>
                                                            </div>
                                                        }
                                                    >
                                                        <img
                                                            src={q.certificateUrl}
                                                            class="w-full h-full object-cover"
                                                            alt={q.title}
                                                        />
                                                    </Show>
                                                </button>

                                                {/* Info */}
                                                <div class="flex-1 flex flex-col gap-1 min-w-0">
                                                    <span class="font-semibold text-foreground truncate">
                                                        {q.title}
                                                    </span>
                                                    <Show when={q.institution}>
                                                        <span class="text-xs text-muted-foreground truncate">
                                                            {q.institution}
                                                        </span>
                                                    </Show>
                                                    <Show
                                                        when={
                                                            q.approvement !== undefined &&
                                                            Number(q.approvement) > 0
                                                        }
                                                    >
                                                        <span class="text-xs text-muted-foreground">
                                                            {formatPercent(
                                                                Number(q.approvement),
                                                            )}
                                                        </span>
                                                    </Show>
                                                    <div class="flex flex-wrap items-center gap-2 mt-1">
                                                        <span
                                                            class={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TYPE_COLORS[q.type ?? ""] ?? "bg-secondary text-foreground"}`}
                                                        >
                                                            {localizeDomain.qualificationType(
                                                                q.type,
                                                            )}
                                                        </span>
                                                        <Show when={q.year}>
                                                            <span class="text-xs text-muted-foreground">
                                                                {q.year}
                                                            </span>
                                                        </Show>
                                                    </div>
                                                </div>

                                                <div class="shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(q)}
                                                        class="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
                                                        title={t().common.edit}
                                                    >
                                                        <EditIcon size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteQualId(q.id)}
                                                        disabled={loading()}
                                                        class="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-30 cursor-pointer"
                                                        title={t().common.delete}
                                                    >
                                                        <TrashIcon size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </Show>
                    </Card>
                </div>
            </Show>

            {/* ── ABA AVALIAÇÕES (RF26) ────────────────────────────────────── */}
            <Show when={activeTab() === "avaliacoes"}>
                <div class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <header>
                        <h2 class="text-xl font-bold text-foreground">
                            {t().reviews.response.tabLabel}
                        </h2>
                        <p class="text-sm text-muted-foreground">
                            {t().professionalSettings.reviewsSubtitle}
                        </p>
                    </header>

                    <Show
                        when={!receivedReviews.loading}
                        fallback={
                            <p class="text-center text-sm text-muted-foreground py-8">
                                {t().reviews.response.loading}
                            </p>
                        }
                    >
                        <Show
                            when={(receivedReviews() ?? []).length > 0}
                            fallback={
                                <div class="p-8 text-center text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                                    {t().reviews.response.noReviewsToManage}
                                </div>
                            }
                        >
                            <For each={receivedReviews()}>
                                {(review) => (
                                    <ReviewManageCard
                                        review={review}
                                        canDelete={false}
                                        onChanged={() => refetchReceivedReviews()}
                                    />
                                )}
                            </For>
                        </Show>
                    </Show>
                </div>
            </Show>

            {/* ── MODAL: Adicionar ──────────────────────────────────────────── */}
            <Modal
                isOpen={showAddModal()}
                onClose={() => setShowAddModal(false)}
                title={t().professionalSettings.addModalTitle}
            >
                <div class="flex flex-col gap-4">
                    <QualificationForm
                        file={addFile()}
                        fileError={addFileError()}
                        onFile={setAddFile}
                        onFileError={setAddFileError}
                        title={addTitle()}
                        onTitle={setAddTitle}
                        institution={addInstitution()}
                        onInstitution={setAddInstitution}
                        approvement={addApprovement()}
                        onApprovement={setAddApprovement}
                        type={addType()}
                        onType={setAddType}
                        year={addYear()}
                        onYear={setAddYear}
                    />
                    <div class="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            class="flex-1"
                            onClick={() => setShowAddModal(false)}
                            disabled={addSubmitting()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            onClick={handleAdd}
                            disabled={addSubmitting() || !addTitle().trim() || !addFile()}
                        >
                            <Show when={addSubmitting()} fallback={t().common.save}>
                                {t().common.saving}
                            </Show>
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── MODAL: Editar ─────────────────────────────────────────────── */}
            <Modal
                isOpen={!!editTarget()}
                onClose={() => setEditTarget(null)}
                title={t().professionalSettings.editModalTitle}
            >
                <div class="flex flex-col gap-4">
                    <QualificationForm
                        file={editFile()}
                        fileError={editFileError()}
                        onFile={setEditFile}
                        onFileError={setEditFileError}
                        title={editTitle()}
                        onTitle={setEditTitle}
                        institution={editInstitution()}
                        onInstitution={setEditInstitution}
                        approvement={editApprovement()}
                        onApprovement={setEditApprovement}
                        type={editType()}
                        onType={setEditType}
                        year={editYear()}
                        onYear={setEditYear}
                        optional={true}
                        currentUrl={editTarget()?.certificateUrl}
                    />
                    <div class="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            class="flex-1"
                            onClick={() => setEditTarget(null)}
                            disabled={editSubmitting()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            onClick={handleEdit}
                            disabled={editSubmitting() || !editTitle().trim()}
                        >
                            <Show when={editSubmitting()} fallback={t().common.save}>
                                {t().common.saving}
                            </Show>
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── MODAL: Preview do certificado ────────────────────────────── */}
            <Modal
                isOpen={!!previewUrl()}
                onClose={() => setPreviewUrl(null)}
                title={t().professionalSettings.viewCertificate}
                size="2xl"
            >
                <Show when={previewUrl()}>
                    <Show
                        when={!isPdf(previewUrl()!)}
                        fallback={
                            <div class="flex flex-col gap-3">
                                <iframe
                                    src={previewUrl()!}
                                    class="w-full rounded-lg border border-border"
                                    style={{ height: "65vh" }}
                                    title={t().professionalSettings.viewCertificate}
                                />
                                <a
                                    href={previewUrl()!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-center text-sm text-primary underline"
                                >
                                    {t().professionalSettings.viewCertificate}
                                </a>
                            </div>
                        }
                    >
                        <div class="flex flex-col gap-3 items-center">
                            <img
                                src={previewUrl()!}
                                class="max-w-full rounded-lg border border-border object-contain"
                                style={{ "max-height": "65vh" }}
                                alt={t().professionalSettings.viewCertificate}
                            />
                            <a
                                href={previewUrl()!}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm text-primary underline"
                            >
                                {t().professionalSettings.viewCertificate}
                            </a>
                        </div>
                    </Show>
                </Show>
            </Modal>

            <Modal
                isOpen={!!deleteQualId()}
                onClose={() => setDeleteQualId(null)}
                title={t().professionalSettings.deleteQualTitle}
                size="sm"
            >
                <div class="flex flex-col gap-5">
                    <p class="text-sm text-muted-foreground">
                        {t().professionalSettings.deleteQualConfirm}
                    </p>
                    <div class="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteQualId(null)}
                            disabled={loading()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteQualification}
                            disabled={loading()}
                        >
                            {loading() ? t().common.wait : t().common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!deletePortfolioId()}
                onClose={() => setDeletePortfolioId(null)}
                title={t().professionalSettings.deletePortfolioTitle}
                size="sm"
            >
                <div class="flex flex-col gap-5">
                    <p class="text-sm text-muted-foreground">
                        {t().professionalSettings.deletePortfolioConfirm}
                    </p>
                    <div class="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeletePortfolioId(null)}
                            disabled={loading()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeletePortfolioImage}
                            disabled={loading()}
                        >
                            {loading() ? t().common.wait : t().common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
