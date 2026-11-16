import { describe, expect, it, vi } from "vitest";
import { ApiError, FetchHttpClient, UnauthorizedResponseInterceptor } from "./HttpClient";

const json = (status: number, body: unknown = {}) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });

describe("FetchHttpClient - renovação de sessão (v5.0.0-7.2.4, 7.4.1)", () => {
    it("renova a sessão uma vez e repete a requisição após 401", async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValueOnce(json(401))
            .mockResolvedValueOnce(json(200)) // /auth/refresh
            .mockResolvedValueOnce(json(200, { ok: true }));
        const client = new FetchHttpClient("/api", [], fetchImpl as any);

        await expect(client.get("/appointments/me")).resolves.toEqual({ ok: true });
        expect(fetchImpl.mock.calls[1][0]).toBe("/api/auth/refresh");
        expect(fetchImpl.mock.calls[1][1]).toMatchObject({
            method: "POST",
            credentials: "include",
        });
    });

    it("compartilha uma única renovação entre requisições concorrentes", async () => {
        let refreshCalls = 0;
        const fetchImpl = vi.fn(async (url: string, init?: RequestInit & { _n?: number }) => {
            if (url.endsWith("/auth/refresh")) {
                refreshCalls += 1;
                return json(200);
            }
            const seen = (fetchImpl as any)._seen ?? new Set<string>();
            (fetchImpl as any)._seen = seen;
            if (!seen.has(url)) {
                seen.add(url);
                return json(401);
            }
            return json(200, { url, method: init?.method });
        });
        const client = new FetchHttpClient("/api", [], fetchImpl as any);

        await Promise.all([client.get("/a"), client.get("/b"), client.get("/c")]);
        expect(refreshCalls).toBe(1);
    });

    it("não tenta renovar rotas de autenticação nem repete mais de uma vez", async () => {
        const emit = vi.fn();
        const fetchImpl = vi.fn().mockResolvedValue(json(401));
        const client = new FetchHttpClient(
            "/api",
            [new UnauthorizedResponseInterceptor({ emit, on: vi.fn(), off: vi.fn() } as any)],
            fetchImpl as any,
        );

        await expect(client.post("/auth/login", {})).rejects.toBeInstanceOf(ApiError);
        expect(fetchImpl).toHaveBeenCalledTimes(1);

        fetchImpl.mockClear();
        await expect(client.get("/appointments/me")).rejects.toBeInstanceOf(ApiError);
        // requisição original + 1 renovação (falhou) = 2 chamadas.
        expect(fetchImpl).toHaveBeenCalledTimes(2);
        expect(emit).toHaveBeenCalledWith("auth:unauthorized", { path: "/appointments/me" });
    });
});
