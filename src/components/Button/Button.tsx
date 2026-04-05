import { splitProps, JSX, Component } from "solid-js";
import "./Button.css";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "destructive" | "pill";
    size?: "sm" | "md" | "lg";
}

export function Button(props: ButtonProps) {
    const [local, rest] = splitProps(props, ["variant", "size", "class", "children"]);

    return (
        <button
            class={`zello-btn ${local.class || ""}`}
            data-variant={local.variant || "primary"}
            data-size={local.size || "md"}
            {...rest}
        >
            {local.children}
        </button>
    );
};