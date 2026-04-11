import { splitProps, JSX } from "solid-js";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
    size?: "sm" | "md" | "lg";
    pill?: boolean;
}

export function Button(props: ButtonProps) {
    const [local, rest] = splitProps(props, [
        "variant",
        "size",
        "pill",
        "class",
        "children"
    ]);

    const variant = () => local.variant || "primary";
    const size = () => local.size || "md";

    return (
        <button
            {...rest}
            class={`inline-flex cursor-pointer select-none items-center justify-center gap-2 border font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 enabled:active:scale-[0.98] ${local.class || ""}`}
            classList={{
                "h-8 px-3 text-xs": size() === "sm",
                "h-10 px-4 text-sm": size() === "md",
                "h-12 px-6 text-base": size() === "lg",

                "rounded-full": local.pill,
                "rounded-lg": !local.pill,


                "border-transparent bg-primary text-primary-foreground enabled:hover:bg-primary/90":
                    variant() === "primary",

                "border-transparent bg-secondary text-secondary-foreground enabled:hover:bg-secondary/80":
                    variant() === "secondary",

                "border-border bg-transparent text-foreground enabled:hover:bg-secondary":
                    variant() === "outline",

                "border-transparent bg-error text-white enabled:hover:bg-error/90":
                    variant() === "destructive",

                "border-transparent bg-transparent text-foreground enabled:hover:bg-secondary":
                    variant() === "ghost",
            }}
        >
            {local.children}
        </button>
    );
}