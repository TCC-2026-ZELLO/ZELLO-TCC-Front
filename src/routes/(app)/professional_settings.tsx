import { createSignal, For, Show, createResource, createEffect, batch } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
import { Modal } from "~/components/Widgets/Modal";
import { getProId } from "~/store/appState";
import { professionalService } from "~/services/professional.service";
import {
    SaveIcon, CameraIcon, TrashIcon, PlusIcon, RibbonIcon
} from "~/components/Icons/Icons";

// ─── Helpers de qualificação ─────────────────────────────────────────────────

const QUALIFICATION_TYPES = [
    { value: "certification", label: "Certificação" },
    { value: "diploma",       label: "Diploma"       },
    { value: "specialization",label: "Especialização" },
    { value: "course",        label: "Curso"          },
] as const;

const TYPE_COLORS: Record<string, string> = {
    diploma:        "bg-blue-100 text-blue-700",
    specialization: "bg-purple-100 text-purple-700",
    course:         "bg-green-100 text-green-700",
    certification:  "bg-amber-100 text-amber-700",
};

const TYPE_LABELS: Record<string, string> = {
    diploma:        "Diploma",
    specialization: "Especialização",
    course:         "Curso",
    certification:  "Certificação",
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB  = 5;

function validateQualificationFile(file: File): string | null {
    if (!ALLOWED_MIME.includes(file.type))
        return "Formato inválido. Use JPEG, PNG, WEBP ou PDF.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
        return `Arquivo muito grande. Limite: ${MAX_SIZE_MB} MB.`;
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfessionalSettings() {
    const [activeTab, setActiveTab] = createSignal("perfil");

    let avatarInput: HTMLInputElement | undefined;
    let bannerInput: HTMLInputElement | undefined;
    let portfolioInput: HTMLInputElement | undefined;

    const [profile, { refetch: refetchProfile }] = createResource(
        getProId,
        professionalService.getPublicProfile
    );

    const [portfolio, { refetch: refetchPortfolio }] = createResource(
        getProId,
        professionalService.getPortfolio
    );

    const [qualifications, { refetch: refetchQualifications }] = createResource(
        getProId,
        professionalService.getQualifications
    );

    // ── Perfil ────────────────────────────────────────────────────────────────
    const [isPublic, setIsPublic]           = createSignal(false);
    const [nome, setNome]                   = createSignal("");
    const [especialidade, setEspecialidade] = createSignal("");
    const [bio, setBio]                     = createSignal("");
    const [loading, setLoading]             = createSignal(false);

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

    // ── Modal de nova qualificação ────────────────────────────────────────────
    const [showModal, setShowModal]           = createSignal(false);
    const [qTitle, setQTitle]                 = createSignal("");
    const [qInstitution, setQInstitution]     = createSignal("");
    const [qType, setQType]                   = createSignal("certification");
    const [qYear, setQYear]                   = createSignal("");
    const [qFile, setQFile]                   = createSignal<File | null>(null);
    const [qFileError, setQFileError]         = createSignal("");
    const [qSubmitting, setQSubmitting]       = createSignal(false);

    const resetModal = () => {
        setQTitle(""); setQInstitution(""); setQType("certification");
        setQYear(""); setQFile(null); setQFileError("");
    };

    const handleQFileChange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const err = validateQualificationFile(file);
        if (err) { setQFileError(err); setQFile(null); return; }
        setQFileError("");
        setQFile(file);
    };

    const handleAddQualification = async () => {
        if (!qFile()) { setQFileError("Anexe o arquivo do certificado."); return; }
        if (!qTitle().trim()) return;

        setQSubmitting(true);
        try {
            await professionalService.addQualification({
                file:        qFile()!,
                title:       qTitle().trim(),
                institution: qInstitution().trim() || undefined,
                type:        qType(),
                year:        qYear() ? Number(qYear()) : undefined,
            });
            await refetchQualifications();
            setShowModal(false);
            resetModal();
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Erro ao adicionar qualificação.";
            setQFileError(typeof msg === "string" ? msg : msg[0]);
        } finally {
            setQSubmitting(false);
        }
    };

    const handleDeleteQualification = async (id: string) => {
        if (!confirm("Remover esta qualificação do seu perfil?")) return;
        setLoading(true);
        try {
            await professionalService.deleteQualification(id);
            await refetchQualifications();
        } catch {
            alert("Erro ao remover qualificação.");
        } finally {
            setLoading(false);
        }
    };

    // ── Handlers existentes ───────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await professionalService.updateProfile({
                bio: bio(),
                visibilityStatus: isPublic(),
                specialty: especialidade()
            });
            alert("Perfil atualizado com sucesso!");
            await refetchProfile();
        } catch {
            alert("Erro ao salvar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (type: "avatar" | "banner" | "portfolio", e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            if (type === "avatar")    await professionalService.updateAvatar(file);
            if (type === "banner")    await professionalService.updateBanner(file);
            if (type === "portfolio") await professionalService.uploadPortfolio(file);
            type === "portfolio" ? await refetchPortfolio() : await refetchProfile();
            alert(`${type === "avatar" ? "Foto de perfil" : type === "banner" ? "Banner" : "Portfólio"} atualizado!`);
        } catch {
            alert("Erro no upload.");
        } finally {
            setLoading(false);
            target.value = "";
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm("Deseja realmente remover esta foto do seu portfólio?")) return;
        setLoading(true);
        try {
            await professionalService.deletePortfolioImage(imageId);
            await refetchPortfolio();
        } catch {
            alert("Erro ao remover imagem.");
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 pb-20 md:py-12 animate-in fade-in duration-300">
            <header class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold text-foreground">Configurações</h1>
                <p class="text-muted-foreground">Gerencie sua vitrine profissional e portfólio no Zello</p>
            </header>

            <Tabs
                activeValue={activeTab()}
                onChange={(v) => setActiveTab(v as string)}
                items={[
                    { label: "Perfil",        value: "perfil"        },
                    { label: "Portfólio",     value: "portfolio"     },
                    { label: "Certificações", value: "certificados"  },
                ]}
            />

            {/* ── ABA PERFIL ──────────────────────────────────────────────── */}
            <Show when={activeTab() === "perfil"}>
                <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">

                    <Card class="flex items-center justify-between p-6 border-l-4 border-l-primary">
                        <div class="flex flex-col">
                            <span class="font-bold">Perfil Ativo no Explore</span>
                            <span class="text-sm text-muted-foreground">Clientes poderão te encontrar na busca pública.</span>
                        </div>
                        <Switch checked={isPublic()} onChange={(e) => setIsPublic(e.currentTarget.checked)} />
                    </Card>

                    <Card class="overflow-hidden flex flex-col">
                        <div
                            class="h-48 bg-muted relative group cursor-pointer overflow-hidden"
                            onClick={() => bannerInput?.click()}
                        >
                            <Show when={profile()?.bannerUrl} fallback={
                                <div class="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground text-sm font-medium">
                                    Clique para adicionar um banner
                                </div>
                            }>
                                <img src={profile()?.bannerUrl} class="w-full h-full object-cover" />
                            </Show>
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                                <CameraIcon size={24} />
                                <span class="text-xs font-bold mt-2">Alterar Banner</span>
                            </div>
                            <input type="file" hidden ref={bannerInput} accept="image/*" onChange={(e) => handleImageUpload("banner", e)} />
                        </div>

                        <div class="px-8 pb-8 flex flex-col gap-6 relative">
                            <div
                                class="relative group size-28 -mt-14 cursor-pointer"
                                onClick={() => avatarInput?.click()}
                            >
                                <img
                                    src={profile()?.photoUrl || `https://ui-avatars.com/api/?name=${nome()}`}
                                    class="size-full rounded-2xl object-cover border-4 border-card shadow-xl bg-muted"
                                />
                                <div class="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <CameraIcon size={20} />
                                </div>
                                <input type="file" hidden ref={avatarInput} accept="image/*" onChange={(e) => handleImageUpload("avatar", e)} />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <Input labelText="Nome Público" value={nome()} disabled={true} />
                                <Input
                                    labelText="Sua Especialidade"
                                    value={especialidade()}
                                    placeholder="Ex: Barbeiro, Designer, etc."
                                    onInput={(e) => setEspecialidade(e.currentTarget.value)}
                                    required
                                />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold">Biografia Profissional</label>
                                <textarea
                                    class="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={bio()}
                                    onInput={(e) => setBio(e.currentTarget.value)}
                                    placeholder="Fale um pouco sobre seu trabalho..."
                                />
                            </div>

                            <Button variant="primary" class="py-4 text-lg" onClick={handleSaveProfile} disabled={loading()}>
                                <Show when={loading()} fallback={<><SaveIcon class="mr-2" /> Salvar Perfil</>}>
                                    Salvando...
                                </Show>
                            </Button>
                        </div>
                    </Card>
                </div>
            </Show>

            {/* ── ABA PORTFÓLIO ────────────────────────────────────────────── */}
            <Show when={activeTab() === "portfolio"}>
                <Card class="p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
                    <header>
                        <h2 class="text-xl font-bold">Galeria de Trabalhos</h2>
                        <p class="text-sm text-muted-foreground">Fotos que aparecem no seu perfil público.</p>
                    </header>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <For each={portfolio()}>
                            {(item) => (
                                <div class="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
                                    <img src={item.url} class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeleteImage(item.id)}
                                            class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 active:scale-95"
                                        >
                                            <TrashIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </For>

                        <input type="file" hidden ref={portfolioInput} accept="image/*" onChange={(e) => handleImageUpload("portfolio", e)} />

                        <div
                            onClick={() => portfolioInput?.click()}
                            class="aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl hover:bg-secondary/50 hover:border-primary transition-all cursor-pointer group"
                        >
                            <div class="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <PlusIcon size={24} />
                            </div>
                            <span class="text-sm font-medium">Nova Foto</span>
                        </div>
                    </div>
                </Card>
            </Show>

            {/* ── ABA CERTIFICAÇÕES ────────────────────────────────────────── */}
            <Show when={activeTab() === "certificados"}>
                <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card class="p-8 flex flex-col gap-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-xl font-bold">Diplomas e Certificações</h2>
                                <p class="text-sm text-muted-foreground">Valide sua autoridade técnica perante os clientes.</p>
                            </div>
                            <Button variant="primary" onClick={() => { resetModal(); setShowModal(true); }} class="flex items-center gap-2">
                                <PlusIcon size={16} /> Adicionar
                            </Button>
                        </div>

                        {/* Lista */}
                        <Show
                            when={!qualifications.loading}
                            fallback={<p class="text-center text-sm text-muted-foreground py-8">Carregando...</p>}
                        >
                            <Show
                                when={(qualifications() ?? []).length > 0}
                                fallback={
                                    <div class="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                                        <RibbonIcon size={40} class="opacity-30" />
                                        <p class="text-sm font-medium">Nenhuma qualificação cadastrada ainda.</p>
                                        <Button variant="outline" onClick={() => { resetModal(); setShowModal(true); }} class="flex items-center gap-2 text-sm">
                                            <PlusIcon size={14} /> Adicionar primeira qualificação
                                        </Button>
                                    </div>
                                }
                            >
                                <div class="flex flex-col gap-3">
                                    <For each={qualifications()}>
                                        {(q) => (
                                            <div class="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                                                {/* Thumbnail ou ícone PDF */}
                                                <div class="shrink-0 size-14 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                                                    <Show
                                                        when={q.certificateUrl && !q.certificateUrl.endsWith(".pdf")}
                                                        fallback={
                                                            <div class="flex flex-col items-center justify-center text-muted-foreground">
                                                                <span class="text-xs font-bold">PDF</span>
                                                            </div>
                                                        }
                                                    >
                                                        <img src={q.certificateUrl} class="w-full h-full object-cover" alt={q.title} />
                                                    </Show>
                                                </div>

                                                {/* Info */}
                                                <div class="flex-1 flex flex-col gap-1 min-w-0">
                                                    <span class="font-semibold text-foreground truncate">{q.title}</span>
                                                    <Show when={q.institution}>
                                                        <span class="text-xs text-muted-foreground truncate">{q.institution}</span>
                                                    </Show>
                                                    <div class="flex items-center gap-2 mt-1">
                                                        <span class={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[q.type] ?? "bg-secondary text-foreground"}`}>
                                                            {TYPE_LABELS[q.type] ?? q.type}
                                                        </span>
                                                        <Show when={q.year}>
                                                            <span class="text-xs text-muted-foreground">{q.year}</span>
                                                        </Show>
                                                    </div>
                                                </div>

                                                {/* Ação */}
                                                <button
                                                    onClick={() => handleDeleteQualification(q.id)}
                                                    disabled={loading()}
                                                    class="shrink-0 p-2 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-30"
                                                    title="Remover qualificação"
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </Show>
                    </Card>
                </div>
            </Show>

            {/* ── MODAL: Adicionar Qualificação ─────────────────────────────── */}
            <Modal
                isOpen={showModal()}
                onClose={() => setShowModal(false)}
                title="Adicionar Qualificação"
            >
                <div class="flex flex-col gap-4">
                    {/* Dropzone do arquivo */}
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase text-muted-foreground">
                            Arquivo do Certificado <span class="text-error">*</span>
                        </span>
                        <label
                            class={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-all
                                ${qFile() ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-secondary"}
                                ${qFileError() ? "border-error" : ""}`}
                        >
                            <Show
                                when={qFile()}
                                fallback={
                                    <>
                                        <RibbonIcon size={24} class="text-muted-foreground" />
                                        <span class="text-sm text-muted-foreground">
                                            Clique para selecionar
                                        </span>
                                        <span class="text-xs text-muted-foreground">JPEG, PNG, WEBP ou PDF · máx. 5 MB</span>
                                    </>
                                }
                            >
                                <span class="text-sm font-semibold text-primary truncate max-w-full px-2">
                                    ✓ {qFile()!.name}
                                </span>
                                <span class="text-xs text-muted-foreground">Clique para trocar</span>
                            </Show>
                            <input
                                type="file"
                                hidden
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                onChange={handleQFileChange}
                            />
                        </label>
                        <Show when={qFileError()}>
                            <span class="text-xs text-error">{qFileError()}</span>
                        </Show>
                    </div>

                    {/* Título */}
                    <Input
                        labelText="Título"
                        placeholder="Ex: Pós-Graduação em Dermatologia"
                        value={qTitle()}
                        onInput={(e) => setQTitle(e.currentTarget.value)}
                        required
                    />

                    {/* Instituição */}
                    <Input
                        labelText="Instituição"
                        placeholder="Ex: USP, Senac, Coursera..."
                        value={qInstitution()}
                        onInput={(e) => setQInstitution(e.currentTarget.value)}
                    />

                    {/* Tipo + Ano lado a lado */}
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold uppercase text-muted-foreground">Tipo</span>
                            <select
                                class="h-12 w-full rounded-lg border border-border bg-transparent px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                value={qType()}
                                onChange={(e) => setQType(e.currentTarget.value)}
                            >
                                <For each={QUALIFICATION_TYPES}>
                                    {(t) => <option value={t.value}>{t.label}</option>}
                                </For>
                            </select>
                        </div>

                        <Input
                            labelText="Ano de conclusão"
                            type="number"
                            placeholder={String(new Date().getFullYear())}
                            value={qYear()}
                            onInput={(e) => setQYear(e.currentTarget.value)}
                        />
                    </div>

                    {/* Ações */}
                    <div class="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            class="flex-1"
                            onClick={() => setShowModal(false)}
                            disabled={qSubmitting()}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            class="flex-1"
                            onClick={handleAddQualification}
                            disabled={qSubmitting() || !qTitle().trim() || !qFile()}
                        >
                            <Show when={qSubmitting()} fallback="Salvar">
                                Salvando...
                            </Show>
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
