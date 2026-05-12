import { accessToken, API } from "~/store/appState";
import { logoutAuth } from "~/services/auth.service";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (path.includes("undefined") || path.includes("null")) {
        console.warn(`[API Guard] Bloqueado: URL contém UUID inválido -> ${path}`);
        throw new Error("UUID inválido na requisição.");
    }

    const headers = new Headers(options.headers);

    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
        headers.set("Content-Type", "application/json");
    }

    const token = accessToken();
    if (token && token !== "session-cookie-active") {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    if (response.status === 401) {
        logoutAuth();
        throw new Error("Sessão expirada");
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro na requisição");

    return data;
}

export const http = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body: any) => request<T>(path, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    patch: <T>(path: string, body: any) => request<T>(path, {
        method: "PATCH",
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};