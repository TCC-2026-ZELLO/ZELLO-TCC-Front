import { createSignal, Show, JSX } from "solid-js";

interface DropdownProps {
    /** Element to click to open the dropdown. Receives the `isOpen` state for styling/animations. */
    trigger: (isOpen: boolean) => JSX.Element;
    /** The content of the menu. Receives the `close` function so inner buttons can close it. */
    children: (close: () => void) => JSX.Element;
    /** Align the floating menu relative to the trigger */
    align?: "left" | "right" | "center";
    /** Classes applied to the floating menu container (backgrounds, borders, shadows) */
    contentClass?: string;
    /** Classes applied to the root wrapper */
    containerClass?: string;
}

export function Dropdown(props: DropdownProps) {
    const [isOpen, setIsOpen] = createSignal(false);

    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen((prev) => !prev);

    const alignClass = () => {
        if (props.align === "left") return "left-0";
        if (props.align === "right") return "right-0";
        return "left-1/2 -translate-x-1/2"; // center
    };

    return (
        <div class={`relative ${props.containerClass || "w-full"}`}>
            {/* 1. Trigger */}
            <div onClick={toggle} class="w-full">
                {props.trigger(isOpen())}
            </div>

            <Show when={isOpen()}>
                {/* 2. Invisible Overlay (Click Outside) */}
                <div class="fixed inset-0 z-40" onClick={close} />

                {/* 3. Floating Menu */}
                <div
                    class={`absolute z-50 mt-2 rounded-xl shadow-xl overflow-hidden min-w-[240px] top-full ${alignClass()} ${
                        props.contentClass || "bg-card border border-border"
                    }`}
                >
                    {props.children(close)}
                </div>
            </Show>
        </div>
    );
}