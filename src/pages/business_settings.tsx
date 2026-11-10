import { batch, createEffect, createResource, createSignal, For, Show } from "solid-js";
import { CameraIcon, PlusIcon, SaveIcon, TrashIcon } from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import { Input } from "../components/Widgets/Input";
import { Modal } from "../components/Widgets/Modal";
import { ReviewManageCard } from "../components/Widgets/ReviewManageCard";
import { Switch } from "../components/Widgets/Switch";
import { Tabs } from "../components/Widgets/Tabs";
import { t } from "../core/i18n";
import { businessService } from "../services/business.service";
import { getBusinessReceivedReviews } from "../services/reviews.service";
import { getActiveBizId } from "../store/appState";
import { toast } from "../store/toastStore";

export default function BusinessSettings() {
    const [activeTab, setActiveTab] = createSignal("perfil");

    let photoInput: HTMLInputElement | undefined;
    let bannerInput: HTMLInputElement | undefined;
    let galleryInput: HTMLInputElement | undefined;

    const [profile, { refetch: refetchProfile }] = createResource(
        getActiveBizId,
        businessService.getProfile,
    );

    const [gallery, { refetch: refetchGallery }] = createResource(
        getActiveBizId,
        businessService.getGallery,
    );

    const [receivedReviews, { refetch: refetchReceivedReviews }] = createResource(
        getActiveBizId,
        getBusinessReceivedReviews,
    );

    const [isPublic, setIsPublic] = createSignal(false);
    const [tradeName, setTradeName] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [deleteImageId, setDeleteImageId] = createSignal<string | null>(null);

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
                visibilityStatus: isPublic(),
            });
            toast.success(t().businessSettings.toasts.saved);
            await refetchProfile();
        } catch {
            toast.error(t().businessSettings.toasts.saveError);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (
        type: "photo" | "banner" | "gallery",
        e: Event,
    ) => {
        const id = getActiveBizId();
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!id || !file) return;

        setLoading(true);
        try {
            if (type === "photo") {
                await businessService.updatePhoto(id, file);
                toast.success(t().businessSettings.toasts.logoUpdated);
            }
            if (type === "banner") {
                await businessService.updateBanner(id, file);
                toast.success(t().businessSettings.toasts.bannerUpdated);
            }
            if (type === "gallery") {
                await businessService.addGalleryImage(id, file);
                toast.success(t().businessSettings.toasts.photoAdded);
            }

            if (type === "gallery") {
                await refetchGallery();
            } else {
                await refetchProfile();
            }
        } catch {
            toast.error(
                type === "photo"
                    ? t().businessSettings.toasts.logoError
                    : type === "banner"
                      ? t().businessSettings.toasts.bannerError
                      : t().businessSettings.toasts.photoAddError,
            );
        } finally {
            setLoading(false);
            target.value = "";
        }
    };

    const confirmDeleteGallery = async () => {
        const id = getActiveBizId();
        const imageId = deleteImageId();
        if (!id || !imageId) return;

        setLoading(true);
        try {
            await businessService.deleteGalleryImage(id, imageId);
            toast.success(t().businessSettings.toasts.photoRemoved);
            setDeleteImageId(null);
            await refetchGallery();
        } catch {
            toast.error(t().businessSettings.toasts.photoRemoveError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Show
            when={getActiveBizId()}
            fallback={
                <div class="flex h-96 items-center justify-center px-6 text-center text-muted-foreground">
                    {t().businessSettings.noBusiness}
                </div>
            }
        >
            <div class="mx-auto flex max-w-4xl flex-col gap-6 sm:gap-8 px-4 py-6 sm:py-8 pb-20 animate-in fade-in duration-300">
                <header class="flex flex-col gap-1">
                    <h1 class="text-2xl sm:text-3xl font-bold text-foreground">
                        {t().businessSettings.title}
                    </h1>
                    <p class="text-sm sm:text-base text-muted-foreground">
                        {t().businessSettings.subtitle}
                    </p>
                </header>

                <Tabs
                    activeValue={activeTab()}
                    onChange={(v) => setActiveTab(v as string)}
                    items={[
                        { label: t().businessSettings.tabs.info, value: "perfil" },
                        { label: t().businessSettings.tabs.gallery, value: "gallery" },
                        { label: t().businessSettings.tabs.reviews, value: "avaliacoes" },
                    ]}
                />

                {/* ABA INFORMAÇÕES */}
                <Show when={activeTab() === "perfil"}>
                    <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <Card class="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-l-4 border-l-primary">
                            <div class="flex flex-col">
                                <span class="font-bold text-foreground">
                                    {t().businessSettings.publicVisibility}
                                </span>
                                <span class="text-sm text-muted-foreground">
                                    {t().businessSettings.publicVisibilityDesc}
                                </span>
                            </div>
                            <Switch
                                checked={isPublic()}
                                onChange={(e) => setIsPublic(e.currentTarget.checked)}
                            />
                        </Card>

                        <Card class="p-0 overflow-hidden flex flex-col">
                            {/* BANNER */}
                            <div
                                class="h-40 sm:h-48 bg-muted relative group cursor-pointer overflow-hidden"
                                onClick={() => bannerInput?.click()}
                                title={t().businessSettings.bannerLabel}
                            >
                                <Show
                                    when={profile()?.bannerUrl}
                                    fallback={
                                        <div class="w-full h-full flex items-center justify-center text-xs text-muted-foreground px-4 text-center">
                                            {t().businessSettings.bannerLabel}
                                        </div>
                                    }
                                >
                                    <img
                                        src={profile()?.bannerUrl}
                                        alt={t().businessSettings.bannerLabel}
                                        class="w-full h-full object-cover"
                                    />
                                </Show>
                                <div class="absolute bottom-3 right-3 md:inset-0 md:bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span class="p-2.5 rounded-full bg-black/60 md:bg-transparent text-white shadow-md md:shadow-none">
                                        <CameraIcon size={22} />
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
                                {/* FOTO PERFIL */}
                                <div
                                    class="relative group size-24 sm:size-28 -mt-12 sm:-mt-14 cursor-pointer"
                                    onClick={() => photoInput?.click()}
                                    title={t().businessSettings.logoLabel}
                                >
                                    <img
                                        src={
                                            profile()?.photoUrl ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(tradeName() || "Z")}`
                                        }
                                        alt={t().businessSettings.logoLabel}
                                        class="size-full rounded-2xl object-cover border-4 border-card shadow-xl bg-muted"
                                    />
                                    <div class="absolute bottom-1 right-1 md:inset-0 md:rounded-2xl md:bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span class="p-1.5 rounded-full bg-black/65 md:bg-transparent text-white">
                                            <CameraIcon size={18} />
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        hidden
                                        ref={photoInput}
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload("photo", e)}
                                    />
                                </div>

                                <Input
                                    labelText={t().businessSettings.nameLabel}
                                    value={tradeName()}
                                    onInput={(e) => setTradeName(e.currentTarget.value)}
                                    required
                                />

                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-semibold text-foreground">
                                        {t().businessSettings.descriptionLabel}
                                    </label>
                                    <textarea
                                        class="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20"
                                        value={description()}
                                        onInput={(e) => setDescription(e.currentTarget.value)}
                                        placeholder={
                                            t().businessSettings.descriptionPlaceholder
                                        }
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
                                                {t().businessSettings.saveInfo}
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

                {/* ABA GALERIA */}
                <Show when={activeTab() === "gallery"}>
                    <Card class="p-5 sm:p-8 flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4">
                        <header>
                            <h2 class="text-xl font-bold text-foreground">
                                {t().businessSettings.galleryTitle}
                            </h2>
                            <p class="text-sm text-muted-foreground">
                                {t().businessSettings.galleryDesc}
                            </p>
                        </header>

                        <Show when={(gallery() ?? []).length === 0}>
                            <p class="text-sm text-muted-foreground">
                                {t().businessSettings.emptyGallery}
                            </p>
                        </Show>

                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <For each={gallery()}>
                                {(item) => (
                                    <div class="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20">
                                        <img
                                            src={item.url}
                                            alt={t().businessSettings.galleryTitle}
                                            class="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div class="absolute top-2 right-2 md:inset-0 flex items-center justify-center md:bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                aria-label={t().businessSettings.deletePhotoTitle}
                                                onClick={() => setDeleteImageId(item.id)}
                                                class="p-2 bg-destructive text-destructive-foreground rounded-full shadow-md hover:opacity-90 cursor-pointer"
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
                                ref={galleryInput}
                                accept="image/*"
                                onChange={(e) => handleImageUpload("gallery", e)}
                            />
                            <button
                                type="button"
                                onClick={() => galleryInput?.click()}
                                class="aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl hover:bg-secondary/50 hover:border-primary transition-colors cursor-pointer text-foreground"
                            >
                                <PlusIcon size={24} />
                                <span class="text-sm font-medium">{t().common.add}</span>
                            </button>
                        </div>
                    </Card>
                </Show>

                {/* ABA AVALIAÇÕES (RF26) */}
                <Show when={activeTab() === "avaliacoes"}>
                    <div class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <header>
                            <h2 class="text-xl font-bold text-foreground">
                                {t().reviews.response.tabLabel}
                            </h2>
                            <p class="text-sm text-muted-foreground">
                                {t().businessSettings.reviewsSubtitle}
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
                                            canDelete={true}
                                            onChanged={() => refetchReceivedReviews()}
                                        />
                                    )}
                                </For>
                            </Show>
                        </Show>
                    </div>
                </Show>
            </div>

            <Modal
                isOpen={!!deleteImageId()}
                onClose={() => setDeleteImageId(null)}
                title={t().businessSettings.deletePhotoTitle}
                size="sm"
            >
                <div class="flex flex-col gap-5">
                    <p class="text-sm text-muted-foreground">
                        {t().businessSettings.deletePhotoConfirm}
                    </p>
                    <div class="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteImageId(null)}
                            disabled={loading()}
                        >
                            {t().common.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteGallery}
                            disabled={loading()}
                        >
                            {loading() ? t().common.wait : t().common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Show>
    );
}