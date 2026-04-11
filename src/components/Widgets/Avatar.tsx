import { splitProps, createSignal, Show, JSX } from "solid-js";

export interface AvatarProps extends JSX.HTMLAttributes<HTMLDivElement> {
    src?: string;
    fallbackInitials: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar(props: AvatarProps) {
    const [local, rest] = splitProps(props, ["src", "fallbackInitials", "size", "class"]);
    const [hasError, setHasError] = createSignal(false);

    const currentSize = () => local.size || "md";

    return (
        <div
            {...rest}
            class={`relative inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground overflow-hidden shrink-0 ${local.class || ""}`}
            classList={{
                "w-8 h-8 text-[32px]": currentSize() === "sm",
                "w-10 h-10 text-[40px]": currentSize() === "md",
                "w-12 h-12 text-[48px]": currentSize() === "lg",
                "w-16 h-16 text-[64px]": currentSize() === "xl",
            }}
        >
            <Show
                when={local.src && !hasError()}
                fallback={
                    <span class="font-semibold text-[0.4em]">
                        {local.fallbackInitials}
                    </span>
                }
            >
                <img
                    src={local.src}
                    class="h-full w-full object-cover"
                    onError={() => setHasError(true)}
                    alt={local.fallbackInitials}
                />
            </Show>
        </div>
    );
}