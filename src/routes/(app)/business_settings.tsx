import { createSignal, For, Show, createResource, createEffect, batch } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
import { getActiveBizId } from "~/store/appState";
import { businessService } from "~/services/business.service";
import {
    SaveIcon, CameraIcon, TrashIcon, PlusIcon
} from "~/components/Icons/Icons";

export default function BusinessSettings() {
    const [activeTab, setActiveTab] = createSignal("perfil");

    let photoInput: HTMLInputElement | undefined;
    let bannerInput: HTMLInputElement | undefined;
    let galleryInput: HTMLInputElement | undefined;

    const [profile, { refetch: refetchProfile }] = createResource(
        getActiveBizId,
        businessService.getProfile
    );

    const [gallery, { refetch: refetchGallery }] = createResource(
        getActiveBizId,
        businessService.getGallery
    );

    const [isPublic, setIsPublic] = createSignal(false);
    const [tradeName, setTradeName] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [loading, setLoading] = createSignal(false);

    createEffect(() => {
        const p = profile();
        if (p) {
            batch(() => {
                setIsPublic(p.visibilityStatus ?? false);
                setTradeName(p.tradeName || "");
                setDescription(p.description || "");
            });
        }
    });

    const handleSaveProfile = async () => {
        const id = getActiveBizId();
        if (!id) return;

        setLoading(true);
        try {
            await businessService.updateProfile(id, {
                tradeName: tradeName(),
                description: description(),
                visibilityStatus: isPublic()
            });
            alert("Dados da empresa atualizados!");
            await refetchProfile();
        } catch (e) {
            alert("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (type: 'photo' | 'banner' | 'gallery', e: Event) => {
        const id = getActiveBizId();
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!id || !file) return;

        setLoading(true);
        try {
            if (type === 'photo') await businessService.updatePhoto(id, file);
            if (type === 'banner') await businessService.updateBanner(id, file);
            if (type === 'gallery') await businessService.addGalleryImage(id, file);

            type === 'gallery' ? await refetchGallery() : await refetchProfile();
        } catch (err) {
            alert("Falha no upload.");
        } finally {
            setLoading(false);
            target.value = "";
        }
    };

    const handleDeleteGallery = async (imageId: string) => {
        const id = getActiveBizId();
        if (!id || !confirm("Remover esta foto da galeria?")) return;

        setLoading(true);
        try {
            await businessService.deleteGalleryImage(id, imageId);
            await refetchGallery();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Show when={getActiveBizId()} fallback={
            <div class="flex h-96 items-center justify-center text-muted-foreground">
                Selecione uma empresa no menu lateral para gerenciar.
            </div>
        }>
            <div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 pb-20 animate-in fade-in duration-300">
                <header class="flex flex-col gap-1">
                    <h1 class="text-3xl font-bold text-foreground">Gestão da Empresa</h1>
                    <p class="text-muted-foreground">Configure a vitrine pública do seu estabelecimento</p>
                </header>

                <Tabs
                    activeValue={activeTab()}
                    onChange={(v) => setActiveTab(v as string)}
                    items={[
                        { label: "Informações", value: "perfil" },
                        { label: "Galeria de Fotos", value: "gallery" },
                    ]}
                />

                {/* ABA INFORMAÇÕES */}
                <Show when={activeTab() === "perfil"}>
                    <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <Card class="flex items-center justify-between p-6 border-l-4 border-l-primary">
                            <div class="flex flex-col">
                                <span class="font-bold">Empresa Visível</span>
                                <span class="text-sm text-muted-foreground">Aparecer nos resultados de busca do Zello.</span>
                            </div>
                            <Switch checked={isPublic()} onChange={(e) => setIsPublic(e.currentTarget.checked)} />
                        </Card>

                        <Card class="overflow-hidden flex flex-col">
                            {/* BANNER */}
                            <div class="h-48 bg-muted relative group cursor-pointer overflow-hidden" onClick={() => bannerInput?.click()}>
                                <Show when={profile()?.bannerUrl} fallback={<div class="w-full h-full flex items-center justify-center text-xs">Clique para adicionar Banner</div>}>
                                    <img src={profile()?.bannerUrl} class="w-full h-full object-cover" />
                                </Show>
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <CameraIcon size={24} />
                                </div>
                                <input type="file" hidden ref={bannerInput} accept="image/*" onChange={(e) => handleImageUpload('banner', e)} />
                            </div>

                            <div class="px-8 pb-8 flex flex-col gap-6 relative">
                                {/* FOTO PERFIL */}
                                <div class="relative group size-28 -mt-14 cursor-pointer" onClick={() => photoInput?.click()}>
                                    <img src={profile()?.photoUrl || `https://ui-avatars.com/api/?name=${tradeName()}`} class="size-full rounded-2xl object-cover border-4 border-card shadow-xl bg-muted" />
                                    <div class="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"><CameraIcon size={20} /></div>
                                    <input type="file" hidden ref={photoInput} accept="image/*" onChange={(e) => handleImageUpload('photo', e)} />
                                </div>

                                <Input labelText="Nome Fantasia" value={tradeName()} onInput={(e) => setTradeName(e.currentTarget.value)} />

                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-semibold">Descrição do Estabelecimento</label>
                                    <textarea
                                        class="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20"
                                        value={description()}
                                        onInput={(e) => setDescription(e.currentTarget.value)}
                                        placeholder="Conte aos clientes o que torna sua empresa especial..."
                                    />
                                </div>

                                <Button variant="primary" class="py-4" onClick={handleSaveProfile} disabled={loading()}>
                                    <Show when={loading()} fallback={<><SaveIcon class="mr-2"/> Salvar Alterações</>}>Salvando...</Show>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </Show>

                {/* ABA GALERIA */}
                <Show when={activeTab() === "gallery"}>
                    <Card class="p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
                        <header>
                            <h2 class="text-xl font-bold">Galeria da Empresa</h2>
                            <p class="text-sm text-muted-foreground">Fotos do ambiente, equipamentos ou resultados gerais.</p>
                        </header>

                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <For each={gallery()}>
                                {(item) => (
                                    <div class="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
                                        <img src={item.url} class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteGallery(item.id)} class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><TrashIcon size={18} /></button>
                                        </div>
                                    </div>
                                )}
                            </For>

                            <input type="file" hidden ref={galleryInput} accept="image/*" onChange={(e) => handleImageUpload('gallery', e)} />
                            <div onClick={() => galleryInput?.click()} class="aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl hover:bg-secondary/50 cursor-pointer group">
                                <PlusIcon size={24} />
                                <span class="text-sm font-medium">Adicionar Foto</span>
                            </div>
                        </div>
                    </Card>
                </Show>
            </div>
        </Show>
    );
}