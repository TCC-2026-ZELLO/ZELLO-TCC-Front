import { useNavigate } from "@solidjs/router";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    Show,
} from "solid-js";
import {
    DollarIcon,
    FilterIcon,
    MapPinIcon,
    SearchIcon,
    StarIcon,
    TargetIcon,
} from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Card } from "../components/Widgets/Card";
import {
    CustomizeViewDrawer,
    SavedPresetsBar,
} from "../components/Widgets/CustomizeViewDrawer";
import type { ScreenCustomizationDefaults } from "../core/application/customization/CustomizeScreenUseCase";
import { container } from "../core/container";
import type {
    BusinessProfileData,
    ProfessionalProfile,
    SavedFilterPreset,
    ScreenCustomizationConfig,
} from "../core/domain/entities/models";
import {
    convertMoneyToBrl,
    formatDate,
    formatDecimal,
    formatMoney,
    formatMoneyHint,
    formatTime,
    localeStrategy,
    localizeDomain,
    t,
} from "../core/i18n";
import { appointmentsService } from "../services/appointments.service";
import { searchService, type SortBy } from "../services/search.service";
import { currentUser, isAuthenticated } from "../store/appState";
import { toast } from "../store/toastStore";

const RATING_OPTIONS = [5, 4, 3] as const;

const EXPLORE_DEFAULTS: ScreenCustomizationDefaults = {
    screenId: "explore",
    viewMode: "cards",
    density: "comfortable",
    visibleColumns: [
        "photo",
        "name",
        "specialty",
        "rating",
        "minPrice",
        "city",
        "actions",
    ],
    widgets: [
        { id: "recommended", enabled: true, order: 0 },
        { id: "mapShortcut", enabled: true, order: 1 },
        { id: "nextAppointment", enabled: false, order: 2 },
        { id: "reputation", enabled: false, order: 3 },
    ],
};

function StarRating(props: { value: number }) {
    return (
        <span class="flex items-center gap-0.5">
            <For each={[1, 2, 3, 4, 5]}>
                {(s) => (
                    <StarIcon
                        size={12}
                        class={
                            s <= Math.round(props.value)
                                ? "text-warning"
                                : "text-muted-foreground/30"
                        }
                    />
                )}
            </For>
        </span>
    );
}

type SearchItem = ProfessionalProfile | BusinessProfileData;

export default function Explore() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = createSignal("");
    const [debouncedQuery, setDebouncedQuery] = createSignal("");
    const [searchType, setSearchType] = createSignal<
        "professionals" | "establishments"
    >("professionals");
    const [sortBy, setSortBy] = createSignal<SortBy>("default");
    const [minRating, setMinRating] = createSignal<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = createSignal("");
    const [showFilters, setShowFilters] = createSignal(false);
    const [isCustomizeOpen, setIsCustomizeOpen] = createSignal(false);

    const scopeId = () => currentUser()?.id || "guest";
    const [viewConfig, setViewConfig] = createSignal<ScreenCustomizationConfig>(
        container.customizeScreenUseCase.load(EXPLORE_DEFAULTS, scopeId()),
    );

    const applyPresetValues = (preset: SavedFilterPreset) => {
        const vals = preset.values;
        if (vals.searchType === "professionals" || vals.searchType === "establishments") {
            setSearchType(vals.searchType);
        }
        if (typeof vals.searchQuery === "string") {
            setSearchQuery(vals.searchQuery);
            setDebouncedQuery(vals.searchQuery);
        }
        if (
            vals.sortBy === "default" ||
            vals.sortBy === "trending" ||
            vals.sortBy === "price_asc"
        ) {
            setSortBy(vals.sortBy);
        }
        setMinRating(
            typeof vals.minRating === "number" && vals.minRating > 0
                ? vals.minRating
                : undefined,
        );
        if (typeof vals.maxPrice === "string") {
            setMaxPrice(vals.maxPrice);
        }
        setViewConfig((prev) => ({ ...prev, activePresetId: preset.id }));
    };

    createEffect(() => {
        const loaded = container.customizeScreenUseCase.load(
            EXPLORE_DEFAULTS,
            scopeId(),
        );
        setViewConfig(loaded);
        const defaultPreset = loaded.presets.find((p) => p.isDefault);
        if (defaultPreset) {
            applyPresetValues(defaultPreset);
        }
    });

    createEffect(() => {
        const q = searchQuery();
        const timer = setTimeout(() => setDebouncedQuery(q), 400);
        return () => clearTimeout(timer);
    });

    const handleSaveCustomization = () => {
        const saved = container.customizeScreenUseCase.save(viewConfig(), scopeId());
        setViewConfig(saved);
        toast.success(t().customization.savedToast);
        setIsCustomizeOpen(false);
    };

    const handleResetCustomization = () => {
        const reset = container.customizeScreenUseCase.reset(
            EXPLORE_DEFAULTS,
            scopeId(),
        );
        setViewConfig(reset);
        toast.info(t().customization.resetToast);
    };

    const handleCreatePreset = (name: string, isDefault: boolean) => {
        const saved = container.customizeScreenUseCase.savePreset(
            viewConfig(),
            name,
            {
                searchType: searchType(),
                searchQuery: searchQuery(),
                sortBy: sortBy(),
                minRating: minRating() ?? 0,
                maxPrice: maxPrice(),
            },
            isDefault,
            scopeId(),
        );
        setViewConfig(saved);
        toast.success(t().customization.presetSavedToast);
    };

    const handleDeletePreset = (presetId: string) => {
        const updated = container.customizeScreenUseCase.deletePreset(
            viewConfig(),
            presetId,
            scopeId(),
        );
        setViewConfig(updated);
        toast.info(t().customization.presetDeletedToast);
    };

    const activeFilterCount = () =>
        (sortBy() !== "default" ? 1 : 0) +
        (minRating() !== undefined ? 1 : 0) +
        (maxPrice() !== "" ? 1 : 0);

    const hasActiveFilters = () => activeFilterCount() > 0;

    const clearFilters = () => {
        setSortBy("default");
        setMinRating(undefined);
        setMaxPrice("");
    };

    const [results] = createResource(
        () => ({
            type: searchType(),
            q: debouncedQuery(),
            sortBy: sortBy(),
            minRating: minRating(),
            maxPriceBrl:
                maxPrice() && Number(maxPrice()) > 0
                    ? Math.round(convertMoneyToBrl(Number(maxPrice())) * 100) / 100
                    : undefined,
        }),
        async ({ type, q, sortBy, minRating, maxPriceBrl }): Promise<SearchItem[]> => {
            if (type === "establishments") {
                return await searchService.businesses(q);
            }
            return await searchService.professionals(q, {
                sortBy,
                minRating,
                maxPrice: maxPriceBrl,
            });
        },
    );

    const [recommended] = createResource(
        () => viewConfig().widgets.some((w) => w.id === "recommended" && w.enabled),
        async (enabled) => {
            if (!enabled) return [];
            try {
                return await searchService.recommended();
            } catch {
                return [];
            }
        },
    );

    const [upcomingAppt] = createResource(
        () =>
            isAuthenticated() &&
            viewConfig().widgets.some((w) => w.id === "nextAppointment" && w.enabled),
        async (enabled) => {
            if (!enabled) return null;
            try {
                const list = await appointmentsService.getAppointments();
                const today = new Date().toISOString().split("T")[0];
                return (
                    list
                        .filter(
                            (a) =>
                                (a.status === "CONFIRMED" || a.status === "PENDING") &&
                                a.date >= today,
                        )
                        .sort((a, b) =>
                            `${a.date}T${a.startTime}`.localeCompare(
                                `${b.date}T${b.startTime}`,
                            ),
                        )[0] ?? null
                );
            } catch {
                return null;
            }
        },
    );

    const [clientReputation] = createResource(
        () =>
            viewConfig().widgets.some((w) => w.id === "reputation" && w.enabled)
                ? currentUser()?.client?.id
                : undefined,
        async (clientId) => {
            if (!clientId) return null;
            try {
                return await appointmentsService.getClientReputation(clientId);
            } catch {
                return null;
            }
        },
    );

    const enabledWidgets = createMemo(() =>
        [...viewConfig().widgets]
            .filter((w) => w.enabled)
            .sort((a, b) => a.order - b.order),
    );

    const hasColumn = (colId: string) =>
        viewConfig().visibleColumns.includes(colId);

    const sortOptions = () => [
        { value: "default" as SortBy, label: t().explore.sortOptions.default, Icon: TargetIcon },
        { value: "trending" as SortBy, label: t().explore.sortOptions.trending, Icon: StarIcon },
        { value: "price_asc" as SortBy, label: t().explore.sortOptions.price_asc, Icon: DollarIcon },
    ];

    const availableColumns = () => [
        { id: "photo", label: t().explore.columns.photo },
        { id: "name", label: t().explore.columns.name },
        { id: "specialty", label: t().explore.columns.specialty },
        { id: "rating", label: t().explore.columns.rating },
        { id: "minPrice", label: t().explore.columns.minPrice },
        { id: "city", label: t().explore.columns.city },
        { id: "actions", label: t().explore.columns.actions },
    ];

    const widgetLabels = () => ({
        recommended: t().explore.widgets.recommended,
        mapShortcut: t().explore.widgets.mapShortcut,
        nextAppointment: t().explore.widgets.nextAppointment,
        reputation: t().explore.widgets.reputation,
    });

    const resolveItemMeta = (item: SearchItem) => {
        const isProf = searchType() === "professionals";
        const name = isProf
            ? (item as ProfessionalProfile).user?.name ||
              (item as ProfessionalProfile).name
            : (item as BusinessProfileData).tradeName ||
              (item as BusinessProfileData).name ||
              t().appointments.fallback.business;
        const specialty = isProf
            ? localizeDomain.specialty(
                  (item as ProfessionalProfile).specialty ||
                      t().publicProfile.defaultSpecialty,
              )
            : localizeDomain.segment(
                  (item as BusinessProfileData).segment || t().explore.businessesTab,
              );
        const rating = Number(item.averageRating ?? item.rating ?? 5);
        const minPrice = item.minPrice;
        const city = item.city || "Curitiba";
        const coverImg =
            item.bannerUrl?.trim() ||
            item.photoUrl?.trim() ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        const targetHref = isProf
            ? `/public_profile/${item.id}`
            : `/business_profile/${item.id}`;
        return { isProf, name, specialty, rating, minPrice, city, coverImg, targetHref };
    };

    return (
        <div class="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
            <header class="flex flex-col gap-4">
                <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {t().explore.title}
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">
                            {t().explore.subtitle}
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <SavedPresetsBar
                            presets={viewConfig().presets}
                            activePresetId={viewConfig().activePresetId}
                            onSelect={applyPresetValues}
                            onOpenCustomize={() => setIsCustomizeOpen(true)}
                        />
                    </div>
                </div>

                <For each={enabledWidgets()}>
                    {(widget) => (
                        <>
                            <Show when={widget.id === "mapShortcut"}>
                                <Card class="flex flex-col justify-between gap-3 border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
                                    <div class="flex items-center gap-3">
                                        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                            <MapPinIcon class="size-5" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-foreground">
                                                {t().explore.widgets.mapShortcut}
                                            </p>
                                            <p class="text-xs text-muted-foreground">
                                                {t().explore.widgets.mapDesc}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => navigate("/mapa")}
                                    >
                                        <MapPinIcon class="mr-1.5 size-4" />
                                        {t().explore.widgets.openMapBtn}
                                    </Button>
                                </Card>
                            </Show>

                            <Show
                                when={
                                    widget.id === "recommended" &&
                                    (recommended() ?? []).length > 0
                                }
                            >
                                <section class="flex flex-col gap-2.5">
                                    <h2 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {t().explore.widgets.recommended}
                                    </h2>
                                    <div class="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                                        <For each={(recommended() ?? []).slice(0, 5)}>
                                            {(pro) => {
                                                const pName =
                                                    pro.user?.name || pro.name;
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/public_profile/${pro.id}`,
                                                            )
                                                        }
                                                        class="flex min-w-[220px] shrink-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50"
                                                    >
                                                        <img
                                                            src={
                                                                pro.photoUrl?.trim() ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(pName)}&background=random`
                                                            }
                                                            alt={pName}
                                                            class="size-11 rounded-full object-cover"
                                                        />
                                                        <div class="min-w-0 flex-1">
                                                            <p class="truncate text-sm font-bold text-foreground">
                                                                {pName}
                                                            </p>
                                                            <p class="truncate text-xs text-muted-foreground">
                                                                {localizeDomain.specialty(
                                                                    pro.specialty ||
                                                                        t().publicProfile
                                                                            .defaultSpecialty,
                                                                )}
                                                            </p>
                                                            <div class="mt-0.5 flex items-center gap-1 text-xs font-semibold text-foreground">
                                                                <StarIcon
                                                                    size={11}
                                                                    class="text-warning"
                                                                />
                                                                {formatDecimal(
                                                                    Number(
                                                                        pro.averageRating ??
                                                                            pro.rating ??
                                                                            5,
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            }}
                                        </For>
                                    </div>
                                </section>
                            </Show>

                            <Show when={widget.id === "nextAppointment" && isAuthenticated()}>
                                <Card class="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t().explore.widgets.nextAppointment}
                                        </p>
                                        <Show
                                            when={upcomingAppt()}
                                            fallback={
                                                <p class="mt-0.5 text-sm text-muted-foreground">
                                                    {t().explore.widgets.noUpcoming}
                                                </p>
                                            }
                                        >
                                            {(appt) => (
                                                <p class="mt-0.5 text-sm font-semibold text-foreground">
                                                    {localizeDomain.serviceName(
                                                        appt().service?.name,
                                                    )}{" "}
                                                    · {formatDate(appt().date)} ·{" "}
                                                    {formatTime(appt().startTime)}
                                                </p>
                                            )}
                                        </Show>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate("/agendamentos")}
                                    >
                                        {t().explore.widgets.viewAppointments}
                                    </Button>
                                </Card>
                            </Show>

                            <Show
                                when={widget.id === "reputation" && clientReputation()}
                            >
                                {(rep) => (
                                    <Card class="flex flex-wrap items-center justify-between gap-3 p-4">
                                        <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t().explore.widgets.reputation}
                                        </span>
                                        <div class="flex flex-wrap gap-2">
                                            <span class="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                                                {t().appointments.reputation.streak(
                                                    rep().successStreak,
                                                )}
                                            </span>
                                            <Show when={rep().noShowCount > 0}>
                                                <span class="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning-foreground">
                                                    {t().appointments.reputation.noShow(
                                                        rep().noShowCount,
                                                    )}
                                                </span>
                                            </Show>
                                        </div>
                                    </Card>
                                )}
                            </Show>
                        </>
                    )}
                </For>

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex w-fit rounded-xl border border-border/50 bg-secondary/50 p-1">
                        <button
                            type="button"
                            class={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:px-6 ${
                                searchType() === "professionals"
                                    ? "bg-card text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setSearchType("professionals")}
                        >
                            {t().explore.professionalsTab}
                        </button>
                        <button
                            type="button"
                            class={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:px-6 ${
                                searchType() === "establishments"
                                    ? "bg-card text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setSearchType("establishments")}
                        >
                            {t().explore.businessesTab}
                        </button>
                    </div>

                    <div class="inline-flex rounded-xl border border-border bg-card p-1">
                        <button
                            type="button"
                            onClick={() =>
                                setViewConfig((c) => ({ ...c, viewMode: "cards" }))
                            }
                            class={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                viewConfig().viewMode === "cards"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t().customization.modes.cards}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setViewConfig((c) => ({ ...c, viewMode: "table" }))
                            }
                            class={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                viewConfig().viewMode === "table"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t().customization.modes.table}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setViewConfig((c) => ({ ...c, viewMode: "compact" }))
                            }
                            class={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                viewConfig().viewMode === "compact"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t().customization.modes.compact}
                        </button>
                    </div>
                </div>
            </header>

            <div class="flex flex-wrap items-center gap-3">
                <div class="relative w-full md:w-96">
                    <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
                        <SearchIcon class="size-4" />
                    </span>
                    <input
                        type="text"
                        placeholder={
                            searchType() === "professionals"
                                ? t().explore.searchProPlaceholder
                                : t().explore.searchBizPlaceholder
                        }
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.currentTarget.value)}
                        class="w-full rounded-xl border border-input bg-card py-2.5 pl-11 pr-4 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    class={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${
                        showFilters()
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary"
                    }`}
                >
                    <FilterIcon class="size-4" />
                    {t().explore.filtersButton}
                    <Show when={activeFilterCount() > 0}>
                        <span class="flex size-5 items-center justify-center rounded-full bg-background/25 text-xs font-bold">
                            {activeFilterCount()}
                        </span>
                    </Show>
                </button>

                <Show when={hasActiveFilters()}>
                    <button
                        type="button"
                        onClick={clearFilters}
                        class="cursor-pointer text-sm text-muted-foreground underline transition-colors hover:text-foreground"
                    >
                        {t().explore.clearFilters}
                    </button>
                </Show>
            </div>

            <Show when={showFilters() && searchType() === "professionals"}>
                <Card class="flex flex-col gap-5 border-primary/20 p-5">
                    <div class="flex flex-col gap-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t().explore.sortLabel}
                        </span>
                        <div class="flex flex-wrap gap-2">
                            <For each={sortOptions()}>
                                {(opt) => (
                                    <button
                                        type="button"
                                        onClick={() => setSortBy(opt.value)}
                                        class={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                            sortBy() === opt.value
                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                : "border-border bg-secondary/50 text-foreground hover:border-primary/60"
                                        }`}
                                    >
                                        <opt.Icon class="size-4" />
                                        {opt.label}
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6 md:flex-row">
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t().explore.minRatingLabel}
                            </span>
                            <div class="flex flex-wrap items-center gap-2">
                                <For each={RATING_OPTIONS}>
                                    {(r) => (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMinRating(
                                                    minRating() === r ? undefined : r,
                                                )
                                            }
                                            class={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                                                minRating() === r
                                                    ? "border-warning bg-warning text-warning-foreground shadow-sm"
                                                    : "border-border bg-secondary/50 text-foreground hover:border-warning"
                                            }`}
                                        >
                                            <StarIcon
                                                size={12}
                                                class={
                                                    minRating() === r
                                                        ? "text-warning-foreground"
                                                        : "text-warning"
                                                }
                                            />
                                            {r}+
                                        </button>
                                    )}
                                </For>
                                <Show when={minRating() !== undefined}>
                                    <button
                                        type="button"
                                        onClick={() => setMinRating(undefined)}
                                        class="ml-1 cursor-pointer text-xs text-muted-foreground underline hover:text-foreground"
                                    >
                                        {t().common.clear}
                                    </button>
                                </Show>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t().explore.maxPriceLabel(t().common.currency)}
                            </span>
                            <div class="flex items-center gap-2">
                                <div class="relative">
                                    <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                                        {t().common.currency}
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="150"
                                        value={maxPrice()}
                                        onInput={(e) =>
                                            setMaxPrice(e.currentTarget.value)
                                        }
                                        class="w-36 rounded-xl border border-input bg-card py-2 pl-10 pr-3 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        min="0"
                                    />
                                </div>
                                <Show when={maxPrice() !== ""}>
                                    <button
                                        type="button"
                                        onClick={() => setMaxPrice("")}
                                        class="cursor-pointer text-xs text-muted-foreground underline hover:text-foreground"
                                    >
                                        {t().common.clear}
                                    </button>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Card>
            </Show>

            <Show
                when={!results.loading}
                fallback={
                    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <For each={[1, 2, 3, 4]}>
                            {() => (
                                <div class="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
                            )}
                        </For>
                    </div>
                }
            >
                <Show
                    when={(results()?.length ?? 0) > 0}
                    fallback={
                        <div class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-secondary/10 py-16 text-center">
                            <div class="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <SearchIcon class="size-8" />
                            </div>
                            <p class="px-4 text-base font-bold text-foreground">
                                {t().explore.empty}
                            </p>
                            <Show when={hasActiveFilters()}>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    class="cursor-pointer text-sm font-semibold text-primary underline"
                                >
                                    {t().explore.clearFilters}
                                </button>
                            </Show>
                        </div>
                    }
                >
                    <Show when={viewConfig().viewMode === "cards"}>
                        <div
                            class={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                                viewConfig().density === "compact" ? "gap-3.5" : "gap-5"
                            }`}
                        >
                            <For each={results()}>
                                {(item) => {
                                    const meta = resolveItemMeta(item);
                                    return (
                                        <Card
                                            class="group flex cursor-pointer flex-col gap-0 overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                                            onClick={() => navigate(meta.targetHref)}
                                        >
                                            <Show when={hasColumn("photo")}>
                                                <div
                                                    class={`relative overflow-hidden rounded-t-lg bg-muted ${
                                                        viewConfig().density === "compact"
                                                            ? "h-32"
                                                            : "h-40"
                                                    }`}
                                                >
                                                    <img
                                                        src={meta.coverImg}
                                                        alt={meta.name}
                                                        class="h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => {
                                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.name)}&background=808080&color=fff`;
                                                        }}
                                                    />
                                                    <Show when={hasColumn("rating")}>
                                                        <div class="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-border/50 bg-background/95 px-2 py-1 text-xs font-black text-foreground shadow backdrop-blur-md">
                                                            <StarIcon class="size-3 text-warning" />
                                                            {formatDecimal(meta.rating)}
                                                        </div>
                                                    </Show>
                                                    <Show
                                                        when={
                                                            hasColumn("minPrice") &&
                                                            meta.minPrice != null
                                                        }
                                                    >
                                                        <div
                                                            class="absolute bottom-3 left-3 rounded-lg bg-success px-2 py-1 text-xs font-bold text-primary-foreground shadow"
                                                            title={
                                                                formatMoneyHint(
                                                                    Number(meta.minPrice),
                                                                ) ?? undefined
                                                            }
                                                        >
                                                            {t().explore.startingAt(
                                                                formatMoney(
                                                                    Number(meta.minPrice),
                                                                ),
                                                            )}
                                                        </div>
                                                    </Show>
                                                </div>
                                            </Show>

                                            <div
                                                class={`flex flex-col gap-1.5 ${
                                                    viewConfig().density === "compact"
                                                        ? "p-3"
                                                        : "p-4"
                                                }`}
                                            >
                                                <Show when={hasColumn("name")}>
                                                    <h3 class="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                                                        {meta.name}
                                                    </h3>
                                                </Show>
                                                <Show when={hasColumn("specialty")}>
                                                    <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        {meta.specialty}
                                                    </p>
                                                </Show>
                                                <Show when={hasColumn("rating")}>
                                                    <div class="mt-1 flex items-center gap-1.5">
                                                        <StarRating value={meta.rating} />
                                                        <span class="text-xs text-muted-foreground">
                                                            {formatDecimal(meta.rating)}
                                                        </span>
                                                    </div>
                                                </Show>
                                                <Show when={hasColumn("city")}>
                                                    <div class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPinIcon class="size-3 opacity-60" />
                                                        {meta.city}
                                                    </div>
                                                </Show>
                                            </div>
                                        </Card>
                                    );
                                }}
                            </For>
                        </div>
                    </Show>

                    <Show when={viewConfig().viewMode === "compact"}>
                        <div class="flex flex-col gap-2.5">
                            <For each={results()}>
                                {(item) => {
                                    const meta = resolveItemMeta(item);
                                    return (
                                        <Card
                                            class="flex cursor-pointer flex-wrap items-center justify-between gap-4 p-3.5 transition-colors hover:border-primary/50"
                                            onClick={() => navigate(meta.targetHref)}
                                        >
                                            <div class="flex min-w-0 items-center gap-3">
                                                <Show when={hasColumn("photo")}>
                                                    <img
                                                        src={meta.coverImg}
                                                        alt={meta.name}
                                                        class="size-12 shrink-0 rounded-xl object-cover"
                                                    />
                                                </Show>
                                                <div class="min-w-0">
                                                    <Show when={hasColumn("name")}>
                                                        <h3 class="truncate font-bold text-foreground">
                                                            {meta.name}
                                                        </h3>
                                                    </Show>
                                                    <p class="truncate text-xs text-muted-foreground">
                                                        <Show when={hasColumn("specialty")}>
                                                            {meta.specialty}
                                                        </Show>
                                                        <Show when={hasColumn("city")}>
                                                            {" · "}
                                                            {meta.city}
                                                        </Show>
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <Show when={hasColumn("rating")}>
                                                    <span class="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                                                        <StarIcon class="size-3.5 text-warning" />
                                                        {formatDecimal(meta.rating)}
                                                    </span>
                                                </Show>
                                                <Show
                                                    when={
                                                        hasColumn("minPrice") &&
                                                        meta.minPrice != null
                                                    }
                                                >
                                                    <span
                                                        class="text-xs font-bold text-success"
                                                        title={
                                                            formatMoneyHint(
                                                                Number(meta.minPrice),
                                                            ) ?? undefined
                                                        }
                                                    >
                                                        {formatMoney(
                                                            Number(meta.minPrice),
                                                        )}
                                                    </span>
                                                </Show>
                                                <Show when={hasColumn("actions")}>
                                                    <Button size="sm" variant="outline">
                                                        {t().explore.viewProfile}
                                                    </Button>
                                                </Show>
                                            </div>
                                        </Card>
                                    );
                                }}
                            </For>
                        </div>
                    </Show>

                    <Show when={viewConfig().viewMode === "table"}>
                        <Card class="overflow-hidden p-0">
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse text-left text-sm">
                                    <thead class="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <Show when={hasColumn("photo")}>
                                                <th class="px-4 py-3">
                                                    {t().explore.columns.photo}
                                                </th>
                                            </Show>
                                            <Show when={hasColumn("name")}>
                                                <th class="px-4 py-3">
                                                    {t().explore.columns.name}
                                                </th>
                                            </Show>
                                            <Show when={hasColumn("specialty")}>
                                                <th class="px-4 py-3">
                                                    {t().explore.columns.specialty}
                                                </th>
                                            </Show>
                                            <Show when={hasColumn("rating")}>
                                                <th class="px-4 py-3">
                                                    {t().explore.columns.rating}
                                                </th>
                                            </Show>
                                            <Show when={hasColumn("minPrice")}>
                                                <th class="px-4 py-3">
                                                    {t().explore.columns.minPrice}
                                                </th>
                                            </Show>
                                            <Show when={hasColumn("city")}>
                                                <th class="px-4 py-3">
                                                    {t().explore.columns.city}
                                                </th>
                                            </Show>
                                            <Show when={hasColumn("actions")}>
                                                <th class="px-4 py-3 text-right">
                                                    {t().explore.columns.actions}
                                                </th>
                                            </Show>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-border">
                                        <For each={results()}>
                                            {(item) => {
                                                const meta = resolveItemMeta(item);
                                                const pad = () =>
                                                    viewConfig().density === "compact"
                                                        ? "px-3 py-2"
                                                        : "px-4 py-3.5";
                                                return (
                                                    <tr
                                                        class="cursor-pointer transition-colors hover:bg-secondary/40"
                                                        onClick={() =>
                                                            navigate(meta.targetHref)
                                                        }
                                                    >
                                                        <Show when={hasColumn("photo")}>
                                                            <td class={pad()}>
                                                                <img
                                                                    src={meta.coverImg}
                                                                    alt={meta.name}
                                                                    class="size-10 rounded-lg object-cover"
                                                                />
                                                            </td>
                                                        </Show>
                                                        <Show when={hasColumn("name")}>
                                                            <td
                                                                class={`${pad()} font-bold text-foreground`}
                                                            >
                                                                {meta.name}
                                                            </td>
                                                        </Show>
                                                        <Show when={hasColumn("specialty")}>
                                                            <td
                                                                class={`${pad()} text-muted-foreground`}
                                                            >
                                                                {meta.specialty}
                                                            </td>
                                                        </Show>
                                                        <Show when={hasColumn("rating")}>
                                                            <td class={pad()}>
                                                                <span class="inline-flex items-center gap-1 font-semibold text-foreground">
                                                                    <StarIcon class="size-3.5 text-warning" />
                                                                    {formatDecimal(
                                                                        meta.rating,
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </Show>
                                                        <Show when={hasColumn("minPrice")}>
                                                            <td
                                                                class={`${pad()} font-semibold text-foreground`}
                                                                title={
                                                                    meta.minPrice != null
                                                                        ? formatMoneyHint(
                                                                              Number(
                                                                                  meta.minPrice,
                                                                              ),
                                                                          ) ?? undefined
                                                                        : undefined
                                                                }
                                                            >
                                                                {meta.minPrice != null
                                                                    ? formatMoney(
                                                                          Number(
                                                                              meta.minPrice,
                                                                          ),
                                                                      )
                                                                    : "—"}
                                                            </td>
                                                        </Show>
                                                        <Show when={hasColumn("city")}>
                                                            <td
                                                                class={`${pad()} text-muted-foreground`}
                                                            >
                                                                {meta.city}
                                                            </td>
                                                        </Show>
                                                        <Show when={hasColumn("actions")}>
                                                            <td
                                                                class={`${pad()} text-right`}
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            meta.targetHref,
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        t().explore
                                                                            .viewProfile
                                                                    }
                                                                </Button>
                                                            </td>
                                                        </Show>
                                                    </tr>
                                                );
                                            }}
                                        </For>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </Show>
                </Show>
            </Show>

            <CustomizeViewDrawer
                isOpen={isCustomizeOpen()}
                onClose={() => setIsCustomizeOpen(false)}
                config={viewConfig()}
                availableModes={[
                    { value: "cards", label: t().customization.modes.cards },
                    { value: "table", label: t().customization.modes.table },
                    { value: "compact", label: t().customization.modes.compact },
                ]}
                availableColumns={availableColumns()}
                widgetLabels={widgetLabels()}
                onChangeConfig={setViewConfig}
                onSave={handleSaveCustomization}
                onReset={handleResetCustomization}
                onCreatePreset={handleCreatePreset}
                onApplyPreset={applyPresetValues}
                onDeletePreset={handleDeletePreset}
            />
        </div>
    );
}
