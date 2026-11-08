import { JSX, splitProps } from "solid-js";

export interface SwitchProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Switch(props: SwitchProps) {
    const [local, rest] = splitProps(props, ["label", "class"]);

    return (
        <label
            class={`group inline-flex items-center gap-3 cursor-pointer select-none
                    has-disabled:opacity-50 has-disabled:cursor-not-allowed
                    ${local.class || ""}`}
        >
            <span class="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input type="checkbox" class="peer sr-only" {...rest} />
                <span
                    class="h-6 w-11 rounded-full border border-border bg-secondary transition-colors duration-150
                           peer-checked:bg-primary
                           peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2"
                />
                <span
                    class="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-card shadow-sm
                           transition-transform duration-150
                           peer-checked:translate-x-5 peer-checked:bg-primary-foreground"
                />
            </span>

            {local.label && (
                <span class="text-sm font-medium text-foreground">{local.label}</span>
            )}
        </label>
    );
}