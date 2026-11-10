import { isServer } from "solid-js/web";
import { container } from "../core/container";
import type {
    AccountType,
    BusinessContext,
    User,
} from "../core/domain/entities/models";
import { RoleAccessPolicy } from "../core/domain/policies/RoleAccessPolicy";
import { STORAGE_KEYS } from "../core/infrastructure/storage/StorageAdapters";
import {
    clearAuthSession,
    persistAuthSession,
    setActiveBusiness,
    setManagedBusinesses,
} from "../store/appState";

export type { AccountType, BusinessContext, User };

export interface RegisterPayload {
    nome: string;
    email: string;
    senha: string;
    termos_aceitos: boolean;
    papel: AccountType;
}

export interface RegisterResponse {
    id: string;
    nome: string;
    email: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
}

export async function loadUserContext(user: User): Promise<BusinessContext[]> {
    if (!user.roles.includes("manager")) return [];
    try {
        const mapped = await container.authRepo.fetchManagedBusinesses();
        setManagedBusinesses(mapped);
        container.storage.set(STORAGE_KEYS.MANAGED_BUSINESSES, mapped);
        if (mapped.length > 0) {
            setActiveBusiness(mapped[0]);
            container.storage.set(STORAGE_KEYS.ACTIVE_BUSINESS, mapped[0]);
        }
        return mapped;
    } catch {
        return [];
    }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const data = await container.authRepo.login(payload);
    const role = RoleAccessPolicy.resolvePrimaryRole(data.user.roles);
    persistAuthSession({
        user: data.user,
        token: "session-cookie-active",
        role,
    });
    await loadUserContext(data.user);
    return data;
}

export async function logout(): Promise<void> {
    try {
        await container.authRepo.logout();
    } catch {}
    clearAuthSession();
    if (!isServer) {
        window.location.href = "/login";
    }
}

export function loginAuth(user: User): void {
    persistAuthSession({
        user,
        token: "session-cookie-active",
        role: RoleAccessPolicy.resolvePrimaryRole(user.roles),
    });
}

export const logoutAuth = (): void => {
    clearAuthSession();
};