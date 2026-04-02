import { splitProps, JSX } from "solid-js";
import "./Switch.css";

export interface SwitchProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Switch(props: SwitchProps) {
    const [local, rest] = splitProps(props, ["label", "class"]);

    return (
        <label class={`zello-switch-wrapper ${local.class || ""}`}>
            <input type="checkbox" class="zello-switch-input" {...rest} />

            <div class="zello-switch-track">
                <div class="zello-switch-thumb"></div>
            </div>

            {local.label && <span class="zello-switch-label">{local.label}</span>}
        </label>
    );
}