import { splitProps, JSX } from "solid-js";

export interface SwitchProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Switch(props: SwitchProps) {
    const [local, rest] = splitProps(props, ["label", "class"]);

    return (
        <label
            class={`group relative inline-flex items-center gap-3 cursor-pointer select-none
                    has-disabled:opacity-50 has-disabled:cursor-not-allowed
                    ${local.class || ""}`}
        >
            <input type="checkbox" class="sr-only peer" {...rest} />

            <div
                class="w-11 h-6 bg-secondary rounded-full transition-colors duration-150
                       [anchor-name:--track]

                       group-has-checked:bg-primary
                       peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-2"
            />


            <div
                class="absolute w-5 h-5 bg-card rounded-full shadow-sm
                       transition-[left] duration-150
                       [position-anchor:--track]
                       top-[calc(anchor(top)+2px)]
                       left-[calc(anchor(left)+2px)]
                       group-has-checked:left-[calc(anchor(right)-20px-2px)]"
            />

            {local.label && (
                <span class="text-sm text-foreground font-medium">
                    {local.label}
                </span>
            )}
        </label>
    );
}