import type { IStorageGateway } from "../../domain/ports";

export const STORAGE_KEYS = {
    USER: "user",
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    ACTIVE_BUSINESS: "active_business",
    MANAGED_BUSINESSES: "managed_businesses",
    ACCOUNT_ROLE: "zello.auth.role",
    THEME: "theme",
    LANGUAGE: "zello.prefs.language",
    EXCHANGE_RATES: "zello.prefs.exchange_rates",
    VIEW_CUSTOMIZATION_PREFIX: "zello.prefs.view.",
} as const;

export const AUTH_SESSION_KEYS = [
    STORAGE_KEYS.USER,
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.ACTIVE_BUSINESS,
    STORAGE_KEYS.MANAGED_BUSINESSES,
    STORAGE_KEYS.ACCOUNT_ROLE,
] as const;

export class LocalStorageAdapter implements IStorageGateway {
    private isAvailable(): boolean {
        return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    }

    get<T>(key: string): T | null {
        if (!this.isAvailable()) return null;
        const raw = window.localStorage.getItem(key);
        if (raw === null) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return raw as unknown as T;
        }
    }

    set<T>(key: string, value: T): void {
        if (!this.isAvailable()) return;
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        window.localStorage.setItem(key, serialized);
    }

    remove(key: string): void {
        if (!this.isAvailable()) return;
        window.localStorage.removeItem(key);
    }

    removeMany(keys: readonly string[]): void {
        if (!this.isAvailable()) return;
        for (const key of keys) {
            window.localStorage.removeItem(key);
        }
    }
}

export class InMemoryStorageAdapter implements IStorageGateway {
    private readonly store = new Map<string, string>();

    get<T>(key: string): T | null {
        const raw = this.store.get(key);
        if (raw === undefined) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return raw as unknown as T;
        }
    }

    set<T>(key: string, value: T): void {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        this.store.set(key, serialized);
    }

    remove(key: string): void {
        this.store.delete(key);
    }

    removeMany(keys: readonly string[]): void {
        for (const key of keys) {
            this.store.delete(key);
        }
    }
}
