import { JSX, splitProps } from "solid-js";

export interface ProgressBarProps extends JSX.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    colorVar?: string;
}

export function ProgressBar(props: ProgressBarProps) {
    const [local, rest] = splitProps(props, ["value", "max", "colorVar", "class"]);

    const percent = () => Math.min(100, Math.max(0, (local.value / (local.max || 100)) * 100));

    return (
        <div
            class={`h-2 w-full overflow-hidden rounded-full bg-secondary ${local.class || ""}`}
            {...rest}
        >
            <div
                class="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                    width: `${percent()}%`,
                    "background-color": `var(${local.colorVar || '--color-warning'})`
                }}
            />
        </div>
    );
}