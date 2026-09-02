export interface LoadingProps {
    label?: string;
}

export function Loading(props: LoadingProps) {
    return (
        <div role="status" aria-live="polite" class="flex flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
            <div class="size-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
            <span class="text-sm">{props.label ?? "Carregando…"}</span>
        </div>
    );
}
