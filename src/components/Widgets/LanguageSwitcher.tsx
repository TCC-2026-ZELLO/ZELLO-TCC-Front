import { For } from "solid-js";
import type { LanguageCode } from "../../core/domain/entities/models";
import { idioma, setLanguage, t } from "../../core/i18n";

const LANGUAGE_ITEMS: ReadonlyArray<{ code: LanguageCode; short: string; currency: string }> = [
    { code: "PT", short: "PT", currency: "BRL" },
    { code: "EN", short: "EN", currency: "USD" },
    { code: "ES", short: "ES", currency: "EUR" },
];

export interface LanguageSwitcherProps {
    compact?: boolean;
    class?: string;
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
    return (
        <div
            role="group"
            aria-label={t().languages.cycleAria}
            class={`inline-flex items-center rounded-lg border border-border bg-secondary/40 p-0.5 ${props.class ?? ""}`}
        >
            <For each={LANGUAGE_ITEMS}>
                {(item) => {
                    const active = () => idioma() === item.code;
                    return (
                        <button
                            type="button"
                            onClick={() => setLanguage(item.code)}
                            aria-pressed={active()}
                            title={`${item.short} · ${item.currency}`}
                            class={`cursor-pointer rounded-md px-2 py-1 text-xs font-bold transition-colors ${
                                active()
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span>{item.short}</span>
                            {!props.compact && (
                                <span class="ml-1 hidden text-[10px] opacity-80 xl:inline">
                                    {item.currency}
                                </span>
                            )}
                        </button>
                    );
                }}
            </For>
        </div>
    );
}
