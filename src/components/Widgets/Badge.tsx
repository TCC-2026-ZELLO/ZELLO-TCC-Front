import { splitProps, JSX } from "solid-js";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLDivElement> {
    variant?: "success" | "warning" | "error" | "default";
}

export function Badge(props: BadgeProps) {
    const [local, rest] = splitProps(props, ["variant", "class", "children"]);

    return (
        <div
            {...rest}
            class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${local.class || ""}`}
            classList={{
                "bg-secondary text-secondary-foreground border-transparent": (local.variant || "default") === "default",
                "bg-success/10 text-success border-success/20": local.variant === "success",
                "bg-warning/10 text-warning border-warning/20": local.variant === "warning",
                "bg-error/10 text-error border-error/20": local.variant === "error",
            }}
        >
            {local.children}
        </div>
    );
}