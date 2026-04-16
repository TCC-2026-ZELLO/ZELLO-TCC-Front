import { Show, JSX } from "solid-js";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: JSX.Element;
}

export function Modal(props: ModalProps) {
    return (
        <Show when={props.isOpen}>
            <div
                class="fixed inset-0 z-50 flex items-center justify-center bg-overlay transition-opacity"
                onClick={props.onClose}
            >
                <div
                    class="relative w-full max-w-md rounded-lg bg-card p-6 shadow-xl border border-border"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div class="mb-4 flex items-center justify-between border-b border-border pb-3">
                        <h3 class="text-lg font-semibold text-foreground">{props.title}</h3>
                        <button
                            onClick={props.onClose}
                            class="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div class="mt-2 text-foreground">
                        {props.children}
                    </div>
                </div>
            </div>
        </Show>
    );
}