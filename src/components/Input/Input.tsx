import { splitProps, JSX, Component, Show } from "solid-js";
import "./Input.css";

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> {
    type?: "text" | "email" | "password" | "number" | "search";
    labelText?: string;
    searchIcon?: boolean;
}

export function Input(props: InputProps) {
    const [local, rest] = splitProps(props, ["labelText", "searchIcon", "class"]);

    return (
        <label class={`zello-input-wrapper ${local.class || ""}`}>
            <Show when={local.labelText}>
                <span class="zello-input-label">{local.labelText}</span>
            </Show>

            <div class="zello-input-container">
                <Show when={local.searchIcon}>
                    <div class="zello-input-icon">
                        {/* SVG Fixo e seguro. Sem risco de mismatch */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </Show>
                <input
                    class="zello-input"
                    data-has-icon={!!local.searchIcon}
                    {...rest}
                />
            </div>
        </label>
    );
}