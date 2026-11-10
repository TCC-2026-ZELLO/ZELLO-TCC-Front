import { JSX, splitProps } from "solid-js";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
    children: JSX.Element;
}

export function Card(props: CardProps) {
    const [local, rest] = splitProps(props, ["children", "class"]);

    return (
        <div
            {...rest}
            class={`bg-card text-foreground rounded-lg shadow-sm p-5 flex flex-col gap-3 border border-border/50 ${local.class || ""}`}
        >
            {local.children}
        </div>
    );
}