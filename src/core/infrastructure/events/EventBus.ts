import type { DomainEventMap, IEventBus } from "../../domain/ports";

export class TypedEventBus implements IEventBus {
    private readonly listeners = new Map<
        keyof DomainEventMap,
        Set<(payload: any) => void>
    >();

    on<K extends keyof DomainEventMap>(
        event: K,
        handler: (payload: DomainEventMap[K]) => void,
    ): () => void {
        let bucket = this.listeners.get(event);
        if (!bucket) {
            bucket = new Set();
            this.listeners.set(event, bucket);
        }
        bucket.add(handler);
        return () => {
            bucket?.delete(handler);
        };
    }

    emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void {
        const bucket = this.listeners.get(event);
        if (!bucket) return;
        for (const handler of Array.from(bucket)) {
            handler(payload);
        }
    }
}
