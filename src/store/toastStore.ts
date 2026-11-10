import { createSignal } from "solid-js";
import { eventBus } from "../core/bootstrap";

export type ToastType = "success" | "error" | "info" | "warning";

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
        setToasts((prev) => prev.filter((item) => item.id !== id));
    }, duration);
}

export function dismissToast(id: number) {
    setToasts((prev) => prev.filter((item) => item.id !== id));
}

export const toast = {
    success: (msg: string) => showToast(msg, "success"),
    error: (msg: string) => showToast(msg, "error"),
    info: (msg: string) => showToast(msg, "info"),
};

eventBus.on("toast:notify", ({ message, type }) => {
    showToast(message, type);
});
