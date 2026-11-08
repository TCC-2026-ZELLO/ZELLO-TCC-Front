import { createSignal, For, Show } from "solid-js";
import { container } from "../../core/container";
import type {
    SavedFilterPreset,
    ScreenCustomizationConfig,
} from "../../core/domain/entities/models";
import { t } from "../../core/i18n";
import { SettingsIcon, StarIcon, TrashIcon, XIcon } from "../Icons/Icons";
import { Button } from "./Button";
import { Input } from "./Input";
import { Switch } from "./Switch";

export interface CustomizeViewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    config: ScreenCustomizationConfig;
    availableModes: ReadonlyArray<{
        value: ScreenCustomizationConfig["viewMode"];
        label: string;
    }>;
    availableColumns: ReadonlyArray<{ id: string; label: string }>;
    widgetLabels: Record<string, string>;
    onChangeConfig: (next: ScreenCustomizationConfig) => void;
    onSave: () => void;
    onReset: () => void;
    onCreatePreset: (name: string, isDefault: boolean) => void;
    onApplyPreset: (preset: SavedFilterPreset) => void;
    onDeletePreset: (presetId: string) => void;
}

export function CustomizeViewDrawer(props: CustomizeViewDrawerProps) {
    const [presetName, setPresetName] = createSignal("");
    const [presetDefault, setPresetDefault] = createSignal(false);

    const sortedWidgets = () =>
        [...props.config.widgets].sort((a, b) => a.order - b.order);

    const handleSavePreset = () => {
        const trimmed = presetName().trim();
        if (!trimmed) return;
        props.onCreatePreset(trimmed, presetDefault());
        setPresetName("");
        setPresetDefault(false);
    };

    return (
        <Show when={props.isOpen}>
            <div
                class="fixed inset-0 z-50 flex justify-end bg-overlay backdrop-blur-xs"
                onClick={props.onClose}
            >
                <aside
                    role="dialog"
                    aria-modal="true"
                    aria-label={t().customization.title}
                    class="flex h-dvh w-full max-w-md flex-col border-l border-border bg-card text-foreground shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header class="flex items-start justify-between gap-3 border-b border-border p-5">
                        <div>
                            <h2 class="text-lg font-bold text-foreground">
                                {t().customization.title}
                            </h2>
                            <p class="mt-0.5 text-xs text-muted-foreground">
                                {t().customization.subtitle}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={props.onClose}
                            aria-label={t().common.close}
                            class="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <XIcon size={18} />
                        </button>
                    </header>

                    <div class="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
                        <section class="flex flex-col gap-2.5">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {t().customization.viewMode}
                            </h3>
                            <div class="grid grid-cols-2 gap-2">
                                <For each={props.availableModes}>
                                    {(mode) => (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                props.onChangeConfig({
                                                    ...props.config,
                                                    viewMode: mode.value,
                                                })
                                            }
                                            class={`cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                                                props.config.viewMode === mode.value
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-foreground hover:border-primary/50"
                                            }`}
                                        >
                                            {mode.label}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </section>

                        <section class="flex flex-col gap-2.5">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {t().customization.density}
                            </h3>
                            <div class="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        props.onChangeConfig({
                                            ...props.config,
                                            density: "comfortable",
                                        })
                                    }
                                    class={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                                        props.config.density === "comfortable"
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background text-foreground"
                                    }`}
                                >
                                    {t().customization.comfortable}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        props.onChangeConfig({
                                            ...props.config,
                                            density: "compact",
                                        })
                                    }
                                    class={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                                        props.config.density === "compact"
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background text-foreground"
                                    }`}
                                >
                                    {t().customization.compactDensity}
                                </button>
                            </div>
                        </section>

                        <section class="flex flex-col gap-2.5">
                            <div>
                                <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {t().customization.widgetsTitle}
                                </h3>
                                <p class="mt-0.5 text-xs text-muted-foreground">
                                    {t().customization.widgetsHint}
                                </p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <For each={sortedWidgets()}>
                                    {(widget, idx) => (
                                        <div class="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                                            <Switch
                                                checked={widget.enabled}
                                                onChange={() =>
                                                    props.onChangeConfig(
                                                        container.customizeScreenUseCase.toggleWidget(
                                                            props.config,
                                                            widget.id,
                                                        ),
                                                    )
                                                }
                                                label={
                                                    props.widgetLabels[widget.id] ?? widget.id
                                                }
                                            />
                                            <div class="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled={idx() === 0}
                                                    title={t().customization.moveUp}
                                                    aria-label={t().customization.moveUp}
                                                    onClick={() =>
                                                        props.onChangeConfig(
                                                            container.customizeScreenUseCase.moveWidget(
                                                                props.config,
                                                                widget.id,
                                                                "up",
                                                            ),
                                                        )
                                                    }
                                                    class="cursor-pointer rounded-md border border-border px-2 py-1 text-xs font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-35 hover:bg-secondary"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx() === sortedWidgets().length - 1}
                                                    title={t().customization.moveDown}
                                                    aria-label={t().customization.moveDown}
                                                    onClick={() =>
                                                        props.onChangeConfig(
                                                            container.customizeScreenUseCase.moveWidget(
                                                                props.config,
                                                                widget.id,
                                                                "down",
                                                            ),
                                                        )
                                                    }
                                                    class="cursor-pointer rounded-md border border-border px-2 py-1 text-xs font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-35 hover:bg-secondary"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </section>

                        <section class="flex flex-col gap-2.5">
                            <div>
                                <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {t().customization.columnsTitle}
                                </h3>
                                <p class="mt-0.5 text-xs text-muted-foreground">
                                    {t().customization.columnsHint}
                                </p>
                            </div>
                            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <For each={props.availableColumns}>
                                    {(col) => {
                                        const isChecked = () =>
                                            props.config.visibleColumns.includes(col.id);
                                        return (
                                            <label class="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked()}
                                                    onChange={() =>
                                                        props.onChangeConfig(
                                                            container.customizeScreenUseCase.toggleColumn(
                                                                props.config,
                                                                col.id,
                                                                2,
                                                            ),
                                                        )
                                                    }
                                                    class="size-4 accent-primary"
                                                />
                                                <span class="truncate">{col.label}</span>
                                            </label>
                                        );
                                    }}
                                </For>
                            </div>
                        </section>

                        <section class="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-3.5">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {t().customization.presetsTitle}
                            </h3>

                            <div class="flex flex-col gap-2">
                                <Input
                                    value={presetName()}
                                    onInput={(e) => setPresetName(e.currentTarget.value)}
                                    placeholder={t().customization.presetPlaceholder}
                                />
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <Switch
                                        checked={presetDefault()}
                                        onChange={(e) =>
                                            setPresetDefault(e.currentTarget.checked)
                                        }
                                        label={t().customization.setAsDefault}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        disabled={!presetName().trim()}
                                        onClick={handleSavePreset}
                                    >
                                        {t().customization.saveCurrentPreset}
                                    </Button>
                                </div>
                            </div>

                            <Show
                                when={props.config.presets.length > 0}
                                fallback={
                                    <p class="text-xs text-muted-foreground">
                                        {t().customization.noPresets}
                                    </p>
                                }
                            >
                                <div class="flex flex-col gap-2 pt-1">
                                    <For each={props.config.presets}>
                                        {(preset) => (
                                            <div class="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
                                                <div class="min-w-0 flex-1">
                                                    <div class="flex items-center gap-1.5">
                                                        <span class="truncate text-xs font-bold text-foreground">
                                                            {preset.name}
                                                        </span>
                                                        <Show when={preset.isDefault}>
                                                            <span class="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                                                {t().customization.defaultBadge}
                                                            </span>
                                                        </Show>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-1.5">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            props.onApplyPreset(preset)
                                                        }
                                                    >
                                                        {t().customization.applyPreset}
                                                    </Button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            props.onDeletePreset(preset.id)
                                                        }
                                                        aria-label={t().common.delete}
                                                        class="cursor-pointer rounded-md p-1.5 text-error transition-colors hover:bg-error/10"
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Show>
                        </section>
                    </div>

                    <footer class="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 p-4">
                        <Button type="button" variant="ghost" size="sm" onClick={props.onReset}>
                            {t().customization.resetDefaults}
                        </Button>
                        <Button type="button" variant="primary" onClick={props.onSave}>
                            {t().customization.saveChanges}
                        </Button>
                    </footer>
                </aside>
            </div>
        </Show>
    );
}

export function SavedPresetsBar(props: {
    presets: readonly SavedFilterPreset[];
    activePresetId?: string | null;
    onSelect: (preset: SavedFilterPreset) => void;
    onOpenCustomize: () => void;
}) {
    return (
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar">
                <For each={props.presets}>
                    {(preset) => (
                        <button
                            type="button"
                            onClick={() => props.onSelect(preset)}
                            class={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                                props.activePresetId === preset.id
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-foreground hover:border-primary/50"
                            }`}
                        >
                            <Show when={preset.isDefault}>
                                <StarIcon class="size-3.5 text-warning" />
                            </Show>
                            <span>{preset.name}</span>
                        </button>
                    )}
                </For>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={props.onOpenCustomize}
                class="shrink-0"
            >
                <SettingsIcon size={15} class="mr-1.5" />
                {t().customization.button}
            </Button>
        </div>
    );
}
