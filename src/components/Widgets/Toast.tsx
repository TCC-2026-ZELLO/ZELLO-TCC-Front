import { For } from "solid-js";
import { toasts, ToastItem } from "../../store/toastStore";

const STYLES: Record<ToastItem["type"], string> = {
    success: "bg-green-600  text-white border-green-700",
    error:   "bg-red-600    text-white border-red-700",
    info:    "bg-foreground text-background border-border",
};

const ICONS: Record<ToastItem["type"], string> = {
    success: "✓",
    error:   "✕",
    info:    "i",
};

export function ToastContainer() {
    return (
        <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <For each={toasts()}>
                {(t) => (
                    <div
                        class={`flex items-center gap-3 min-w-[260px] max-w-sm px-4 py-3 rounded-xl border shadow-lg text-sm font-medium
                            animate-in slide-in-from-bottom-4 fade-in duration-300
                            ${STYLES[t.type]}`}
                    >
                        <span class="shrink-0 size-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                            {ICONS[t.type]}
                        </span>
                        <span class="flex-1">{t.message}</span>
                    </div>
                )}
            </For>
        </div>
    );
}
