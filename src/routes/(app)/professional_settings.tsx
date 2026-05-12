import { createSignal, For, Show, createResource, createEffect, batch } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
import { getProId } from "~/store/appState";
import { professionalService } from "~/services/professional.service";
import {
    SaveIcon, CameraIcon, TrashIcon, PlusIcon
} from "~/components/Icons/Icons";

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
        } catch (e) {
            alert("Erro ao salvar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (type: 'avatar' | 'banner' | 'portfolio', e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            if (type === 'avatar') await professionalService.updateAvatar(file);
            if (type === 'banner') await professionalService.updateBanner(file);
            if (type === 'portfolio') await professionalService.uploadPortfolio(file);

            type === 'portfolio' ? await refetchPortfolio() : await refetchProfile();

            alert(`${type === 'avatar' ? 'Foto de perfil' : type === 'banner' ? 'Banner' : 'Portfólio'} atualizado!`);
        } catch (err) {
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
        } catch (err) {
            alert("Erro ao remover imagem.");
        } finally {
            setLoading(false);
        }
    };

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
                    { label: "Perfil", value: "perfil" },
                    { label: "Portfólio", value: "portfolio" },
                    { label: "Certificações", value: "certificados" },
                ]}
            />

            {/* ABA PERFIL */}
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
                        {/* BANNER EDITÁVEL */}
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
                            <input type="file" hidden ref={bannerInput} accept="image/*" onChange={(e) => handleImageUpload('banner', e)} />
                        </div>

                        <div class="px-8 pb-8 flex flex-col gap-6 relative">
                            {/* FOTO DE PERFIL EDITÁVEL (AVATAR) */}
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
                                <input type="file" hidden ref={avatarInput} accept="image/*" onChange={(e) => handleImageUpload('avatar', e)} />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <Input labelText="Nome Público" value={nome()} disabled={true} />
                                <Input
                                    labelText="Sua Especialidade"
                                    value={especialidade()}
                                    placeholder="Ex: Barbeiro, Designer, etc."
                                    onInput={(e) => setEspecialidade(e.currentTarget.value)}
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
                                <Show when={loading()} fallback={<><SaveIcon class="mr-2"/> Salvar Perfil</>}>
                                    Salvando...
                                </Show>
                            </Button>
                        </div>
                    </Card>
                </div>
            </Show>

            {/* ABA PORTFÓLIO */}
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

                        <input
                            type="file"
                            hidden
                            ref={portfolioInput}
                            accept="image/*"
                            onChange={(e) => handleImageUpload('portfolio', e)}
                        />

                        <div
                            onClick={() => portfolioInput?.click()}
                            class="aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl hover:bg-secondary/50 hover:border-primary transition-all cursor-pointer group"
                        >
                            <div class="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform"><PlusIcon size={24} /></div>
                            <span class="text-sm font-medium">Nova Foto</span>
                        </div>
                    </div>
                </Card>
            </Show>
        </div>
    );
}