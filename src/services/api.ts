import { container } from "../core/container";
import { ApiError } from "../core/infrastructure/http/HttpClient";

export { ApiError };

export const http = {
    get: <T>(path: string, options?: RequestInit) => container.httpClient.get<T>(path, options),
    post: <T>(path: string, body: unknown, options?: RequestInit) =>
        container.httpClient.post<T>(path, body, options),
    patch: <T>(path: string, body: unknown, options?: RequestInit) =>
        container.httpClient.patch<T>(path, body, options),
    delete: <T>(path: string, options?: RequestInit) =>
        container.httpClient.delete<T>(path, options),
};