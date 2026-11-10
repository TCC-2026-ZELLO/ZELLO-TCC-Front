import { For } from "solid-js";
import { ToastItem, toasts } from "../../store/toastStore";

const STYLES: Record<ToastItem["type"], string> = {
    success: "bg-success text-white border-border",
    error: "bg-error text-error-foreground border-border",
    warning: "bg-warning text-warning-foreground border-border",
    info: "bg-primary text-primary-foreground border-border",
};

const ICONS: Record<ToastItem["type"], string> = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
};

export function ToastContainer() {
    return (
        <div
            role="region"
            aria-label="Notificações do sistema"
            class="pointer-events-none fixed right-4 bottom-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] flex flex-col items-end gap-3"
        >
            <For each={toasts()}>
                {(item) => (
                    <div
                        role={item.type === "error" ? "alert" : "status"}
                        aria-live={item.type === "error" ? "assertive" : "polite"}
                        aria-atomic="true"
                        class={`pointer-events-auto flex w-full sm:w-auto sm:min-w-[260px] max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg
                            animate-in slide-in-from-bottom-4 fade-in duration-300
                            ${STYLES[item.type]}`}
                    >
                        <span
                            aria-hidden="true"
                            class="flex size-5 shrink-0 items-center justify-center rounded-full bg-black/15 text-xs font-bold"
                        >
                            {ICONS[item.type]}
                        </span>
                        <span class="flex-1">{item.message}</span>
                    </div>
                )}
            </For>
        </div>
    );
}
