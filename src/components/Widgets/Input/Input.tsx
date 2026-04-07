import { splitProps, JSX, Show, createSignal } from "solid-js";
import "./Input.css";

export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> {
    type?: "text" | "email" | "password" | "number" | "search" | "tel";
    labelText?: string;
    searchIcon?: boolean;
    error?: string;
    validate?: (value: string) => string | null | undefined;
}

export function Input(props: InputProps) {
    const [local, rest] = splitProps(props, ["labelText", "searchIcon", "class", "error", "validate", "onBlur", "onInput", "type"]);
    const [internalError, setInternalError] = createSignal<string | null>(null);
    const [showPassword, setShowPassword] = createSignal(false);

    const currentError = () => local.error || internalError();
    const handleBlur = (e: FocusEvent) => {
        const target = e.target as HTMLInputElement;
        if (local.validate) {
            setInternalError(local.validate(target.value) || null);
        }
        if (typeof local.onBlur === "function") {
            local.onBlur(e as any);
        }
    };

    const handleInput = (e: InputEvent) => {
        if (internalError()) {
            setInternalError(null);
        }
        if (typeof local.onInput === "function") {
            local.onInput(e as any);
        }
    };

    const inputType = () => {
        if (local.type === "password") {
            return showPassword() ? "text" : "password";
        }
        return local.type || "text";
    };

    return (
        <label class={`zello-input-wrapper ${local.class || ""}`} style={{ display: "flex", "flex-direction": "column", width: "100%" }}>
            <Show when={local.labelText}>
                <span class="zello-input-label" style={{ "font-size": "12px", "font-weight": "600", color: "var(--color-muted-foreground, #6B7280)", "margin-bottom": "8px" }}>
                    {local.labelText}
                </span>
            </Show>

            <div class="zello-input-container" style={{ position: "relative", display: "flex", "align-items": "center" }}>
                <Show when={local.searchIcon}>
                    <div class="zello-input-icon" style={{ position: "absolute", left: "12px", display: "flex", color: "var(--color-muted-foreground, #9CA3AF)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </Show>

                <input
                    class="zello-input"
                    type={inputType()}
                    data-has-icon={!!local.searchIcon}
                    data-invalid={!!currentError()}
                    onBlur={handleBlur}
                    onInput={handleInput}
                    style={{
                        width: "100%",
                        "padding-right": local.type === "password" ? "40px" : undefined,
                        border: currentError() ? "1px solid var(--color-destructive, #EF4444)" : undefined,
                        outline: currentError() ? "none" : undefined,
                    }}
                    {...rest}
                />

                <Show when={local.type === "password"}>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword())}
                        style={{
                            position: "absolute",
                            right: "12px",
                            background: "none",
                            border: "none",
                            padding: "4px",
                            cursor: "pointer",
                            color: "var(--color-muted-foreground, #9CA3AF)",
                            display: "flex",
                            "align-items": "center",
                            "justify-content": "center"
                        }}
                        title={showPassword() ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword() ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                    </button>
                </Show>
            </div>

            <Show when={currentError()}>
                <span style={{ color: "var(--color-destructive, #EF4444)", "font-size": "12px", "margin-top": "4px", display: "block" }}>
                    {currentError()}
                </span>
            </Show>
        </label>
    );
}