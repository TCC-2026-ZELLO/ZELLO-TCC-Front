import { JSX, createSignal, splitProps } from "solid-js";
import "./IconButton.css";

export function IconButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>){
    return (
        <button class={`zello-icon-btn ${props.class || ""}`} {...props}>
            {props.children}
        </button>
    );
}

export interface IconToggleProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    onActiveChange?: (active: boolean) => void;
}

export function IconToggle(props: IconToggleProps){
    const [local, rest] = splitProps(props, ["active", "onActiveChange", "class", "onClick", "children"]);

    const [internalActive, setInternalActive] = createSignal(local.active || false);
    const isToggled = () => local.active !== undefined ? local.active : internalActive();

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
            class={`zello-icon-btn zello-icon-toggle ${local.class || ""}`}
            data-active={isToggled()}
            aria-pressed={isToggled()}
            onClick={handleClick}
            {...rest}
        >
            {local.children}
        </button>
    );
}