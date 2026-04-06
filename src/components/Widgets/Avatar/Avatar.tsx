import { splitProps, Component, createSignal, Show } from "solid-js";
import "./Avatar.css";

export interface AvatarProps {
    src?: string;
    fallbackInitials: string;
    size?: "sm" | "md" | "lg" | "xl";
    class?: string;
}

export function Avatar(props: AvatarProps) {
    const [local, rest] = splitProps(props, ["src", "fallbackInitials", "size", "class"]);
    const [hasError, setHasError] = createSignal(false);

    return (
        <div class={`zello-avatar ${local.class || ""}`} data-size={local.size || "md"} {...rest}>
            <Show
                when={local.src && !hasError()}
                fallback={<span class="zello-avatar-fallback">{local.fallbackInitials}</span>}
            >
                <img src={local.src} class="zello-avatar-image" onError={() => setHasError(true)} alt="" />
            </Show>
        </div>
    );
}