import { JSX, splitProps } from "solid-js";

export function Dropzone(props: JSX.HTMLAttributes<HTMLDivElement>) {
    const [local, rest] = splitProps(props, ["class"]);

    return (
        <div
            class={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-[var(--color-input-background,transparent)] p-6 text-center transition-all duration-200 hover:border-primary hover:bg-secondary ${local.class || ""}`}
            {...rest}
        >
            <div class="text-2xl text-muted-foreground">+</div>
            <p class="text-sm text-muted-foreground">
                Arraste ou clique<br/>para adicionar
            </p>
        </div>
    );
}