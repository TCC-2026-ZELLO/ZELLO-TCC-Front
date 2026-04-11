import { JSX, createSignal, splitProps } from "solid-js";

export function IconButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
    const [local, rest] = splitProps(props, ["class", "children"]);

    return (
        <button
            class={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground ${local.class || ""}`}
            {...rest}
        >
            {local.children}
        </button>
    );
}


export interface IconToggleProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    onActiveChange?: (active: boolean) => void;
}

export function IconToggle(props: IconToggleProps) {
    const [local, rest] = splitProps(props, [
        "active",
        "onActiveChange",
        "class",
        "onClick",
        "children"
    ]);

    const [internalActive, setInternalActive] = createSignal(local.active || false);
    const isToggled = () => (local.active !== undefined ? local.active : internalActive());

    const handleClick = (e: any) => {
        const newState = !isToggled();

        if (local.active === undefined) {
            setInternalActive(newState);
        }
        if (local.onActiveChange) local.onActiveChange(newState);
        if (typeof local.onClick === "function") local.onClick(e);
    };

    return (
        <button
            class={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-[0.85] data-[active=true]:text-error data-[active=true]:[&_svg]:fill-current ${local.class || ""}`}
            data-active={isToggled()}
            aria-pressed={isToggled()}
            onClick={handleClick}
            {...rest}
        >
            {local.children}
        </button>
    );
}