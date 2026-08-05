import { accessToken, API } from "../store/appState";
import { logoutAuth } from "./auth.service";

export class ApiError extends Error {
    public status: number;
    public data: any;
    
    constructor(message: string, status: number, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

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
        throw new ApiError("Sessão expirada", 401);
    }

    const data = await response.json();
    if (!response.ok) throw new ApiError(data.message || "Erro na requisição", response.status, data);

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