import type {
    SavedFilterPreset,
    ScreenCustomizationConfig,
    WidgetPreference,
} from "../../domain/entities/models";
import type { IStorageGateway } from "../../domain/ports";
import { STORAGE_KEYS } from "../../infrastructure/storage/StorageAdapters";

export interface ScreenCustomizationDefaults {
    screenId: string;
    viewMode: ScreenCustomizationConfig["viewMode"];
    density: ScreenCustomizationConfig["density"];
    visibleColumns: string[];
    widgets: WidgetPreference[];
}

export class CustomizeScreenUseCase {
    constructor(private readonly storage: IStorageGateway) {}

    private buildStorageKey(screenId: string, scopeId?: string): string {
        return `${STORAGE_KEYS.VIEW_CUSTOMIZATION_PREFIX}${screenId}${scopeId ? `.${scopeId}` : ""}`;
    }

    createDefaultConfig(defaults: ScreenCustomizationDefaults): ScreenCustomizationConfig {
        return {
            screenId: defaults.screenId,
            viewMode: defaults.viewMode,
            density: defaults.density,
            visibleColumns: [...defaults.visibleColumns],
            widgets: defaults.widgets.map((w, idx) => ({ ...w, order: w.order ?? idx })),
            presets: [],
            activePresetId: null,
            updatedAt: new Date().toISOString(),
        };
    }

    load(defaults: ScreenCustomizationDefaults, scopeId?: string): ScreenCustomizationConfig {
        const key = this.buildStorageKey(defaults.screenId, scopeId);
        const saved = this.storage.get<ScreenCustomizationConfig>(key);
        if (!saved) return this.createDefaultConfig(defaults);

        const mergedWidgets = defaults.widgets.map((def, idx) => {
            const existing = saved.widgets?.find((w) => w.id === def.id);
            return existing ? { ...def, ...existing } : { ...def, order: idx + 100 };
        });
        mergedWidgets.sort((a, b) => a.order - b.order);

        return {
            screenId: defaults.screenId,
            viewMode: saved.viewMode ?? defaults.viewMode,
            density: saved.density ?? defaults.density,
            visibleColumns:
                Array.isArray(saved.visibleColumns) && saved.visibleColumns.length > 0
                    ? saved.visibleColumns
                    : [...defaults.visibleColumns],
            widgets: mergedWidgets.map((w, idx) => ({ ...w, order: idx })),
            presets: Array.isArray(saved.presets) ? saved.presets : [],
            activePresetId: saved.activePresetId ?? null,
            updatedAt: saved.updatedAt ?? new Date().toISOString(),
        };
    }

    save(config: ScreenCustomizationConfig, scopeId?: string): ScreenCustomizationConfig {
        const updated: ScreenCustomizationConfig = {
            ...config,
            updatedAt: new Date().toISOString(),
        };
        this.storage.set(this.buildStorageKey(config.screenId, scopeId), updated);
        return updated;
    }

    reset(defaults: ScreenCustomizationDefaults, scopeId?: string): ScreenCustomizationConfig {
        const current = this.load(defaults, scopeId);
        const fresh: ScreenCustomizationConfig = {
            ...this.createDefaultConfig(defaults),
            presets: current.presets,
        };
        this.storage.set(this.buildStorageKey(defaults.screenId, scopeId), fresh);
        return fresh;
    }

    toggleColumn(
        config: ScreenCustomizationConfig,
        columnId: string,
        minColumns = 2,
    ): ScreenCustomizationConfig {
        const exists = config.visibleColumns.includes(columnId);
        if (exists && config.visibleColumns.length <= minColumns) {
            return config;
        }
        const visibleColumns = exists
            ? config.visibleColumns.filter((c) => c !== columnId)
            : [...config.visibleColumns, columnId];
        return { ...config, visibleColumns };
    }

    toggleWidget(config: ScreenCustomizationConfig, widgetId: string): ScreenCustomizationConfig {
        const widgets = config.widgets.map((w) =>
            w.id === widgetId ? { ...w, enabled: !w.enabled } : w,
        );
        return { ...config, widgets };
    }

    moveWidget(
        config: ScreenCustomizationConfig,
        widgetId: string,
        direction: "up" | "down",
    ): ScreenCustomizationConfig {
        const sorted = [...config.widgets].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((w) => w.id === widgetId);
        if (idx === -1) return config;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return config;

        const copy = [...sorted];
        const temp = copy[idx];
        copy[idx] = copy[swapIdx];
        copy[swapIdx] = temp;

        return {
            ...config,
            widgets: copy.map((w, i) => ({ ...w, order: i })),
        };
    }

    savePreset(
        config: ScreenCustomizationConfig,
        name: string,
        values: SavedFilterPreset["values"],
        isDefault = false,
        scopeId?: string,
    ): ScreenCustomizationConfig {
        const id = `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const presets = config.presets.map((p) => (isDefault ? { ...p, isDefault: false } : p));
        const newPreset: SavedFilterPreset = {
            id,
            name: name.trim(),
            values,
            isDefault,
            createdAt: new Date().toISOString(),
        };
        return this.save(
            {
                ...config,
                presets: [...presets, newPreset],
                activePresetId: id,
            },
            scopeId,
        );
    }

    deletePreset(
        config: ScreenCustomizationConfig,
        presetId: string,
        scopeId?: string,
    ): ScreenCustomizationConfig {
        return this.save(
            {
                ...config,
                presets: config.presets.filter((p) => p.id !== presetId),
                activePresetId: config.activePresetId === presetId ? null : config.activePresetId,
            },
            scopeId,
        );
    }
}
