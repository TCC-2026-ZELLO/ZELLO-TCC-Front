import { createSignal } from "solid-js";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

let _counter = 0;

const [toasts, setToasts] = createSignal<ToastItem[]>([]);

export { toasts };

export function showToast(message: string, type: ToastType = "info", duration = 3500) {
    const id = ++_counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
}

export const toast = {
    success: (msg: string) => showToast(msg, "success"),
    error:   (msg: string) => showToast(msg, "error"),
    info:    (msg: string) => showToast(msg, "info"),
};
