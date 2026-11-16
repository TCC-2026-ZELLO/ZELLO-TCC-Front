import { For, Show } from "solid-js";
import { Button } from "../Widgets/Button";
import { Input } from "../Widgets/Input";
import { PERIOD_PRESETS, PeriodPresetId, PeriodRange } from "../../utils/dashboard-format";

interface PeriodSelectorProps {
    range: PeriodRange;
    activePreset: PeriodPresetId | null;
    error: string | null;
    onPresetSelect: (preset: PeriodPresetId) => void;
    onRangeChange: (range: PeriodRange) => void;
}

// Atalhos no mesmo estilo dos filtros de categoria do Catálogo + datas personalizadas.
export function PeriodSelector(props: PeriodSelectorProps) {
    return (
        <div class="flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
                <div class="flex gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar pb-1">
                    <For each={PERIOD_PRESETS}>
                        {(preset) => (
                            <Button
                                variant={props.activePreset === preset.id ? "primary" : "outline"}
                                size="sm"
                                onClick={() => props.onPresetSelect(preset.id)}
                            >
                                {preset.label}
                            </Button>
                        )}
                    </For>
                </div>

                <div class="grid grid-cols-2 gap-4 w-full lg:w-96">
                    <Input
                        labelText="De"
                        type="date"
                        value={props.range.from}
                        max={props.range.to}
                        onInput={(e) => props.onRangeChange({ from: e.currentTarget.value, to: props.range.to })}
                    />
                    <Input
                        labelText="Até"
                        type="date"
                        value={props.range.to}
                        min={props.range.from}
                        onInput={(e) => props.onRangeChange({ from: props.range.from, to: e.currentTarget.value })}
                    />
                </div>
            </div>

            <Show when={props.error}>
                <span role="alert" class="text-xs text-error">{props.error}</span>
            </Show>
        </div>
    );
}
