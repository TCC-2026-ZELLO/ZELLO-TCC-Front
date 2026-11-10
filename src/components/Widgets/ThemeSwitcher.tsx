import { Show } from "solid-js";
import { t } from "../../core/i18n";
import { theme, toggleTheme } from "../../store/appState";
import { ContrastIcon, MoonIcon, SunIcon } from "../Icons/Icons";

export interface ThemeSwitcherProps {
    showLabel?: boolean;
    class?: string;
}

export function ThemeSwitcher(props: ThemeSwitcherProps) {
    const currentLabel = () => {
        const mode = theme();
        if (mode === "dark") return t().themes.darkShort;
        if (mode === "high-contrast") return t().themes.highContrastShort;
        return t().themes.lightShort;
    };

    const fullTitle = () => {
        const mode = theme();
        if (mode === "dark") return `${t().themes.label}: ${t().themes.dark}`;
        if (mode === "high-contrast") return `${t().themes.label}: ${t().themes.highContrast}`;
        return `${t().themes.label}: ${t().themes.light}`;
    };

    return (
        <button
            type="button"
            onClick={() => toggleTheme()}
            aria-label={t().themes.cycleAria}
            title={fullTitle()}
            class={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary ${props.class ?? ""}`}
        >
            <span aria-hidden="true" class="flex items-center justify-center leading-none">
                <Show when={theme() === "light"}>
                    <SunIcon class="size-4" />
                </Show>
                <Show when={theme() === "dark"}>
                    <MoonIcon class="size-4" />
                </Show>
                <Show when={theme() === "high-contrast"}>
                    <ContrastIcon class="size-4" />
                </Show>
            </span>
            <Show when={props.showLabel}>
                <span class="hidden sm:inline">{currentLabel()}</span>
            </Show>
        </button>
    );
}
