import { splitProps, JSX } from "solid-js";
import "./Badge.css";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: "success" | "warning" | "error" | "default";
}

export function Badge (props: BadgeProps) {
    const [local, rest] = splitProps(props, ["variant", "class", "children"]);

    return (
        <div
            class={`zello-badge ${local.class || ""}`}
            data-variant={local.variant || "default"}
            {...rest}
        >
            {local.children}
        </div>
    );
}