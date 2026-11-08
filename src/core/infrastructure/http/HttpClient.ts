import type {
    IEventBus,
    IHttpClient,
    ILocaleProvider,
    ITokenProvider,
} from "../../domain/ports";

export class ApiError extends Error {
    public readonly status: number;
    public readonly data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export interface HttpRequestContext {
    path: string;
    url: string;
    init: RequestInit;
    headers: Headers;
}

export interface HttpInterceptor {
    onRequest?(ctx: HttpRequestContext): HttpRequestContext | Promise<HttpRequestContext>;
    onResponse?(response: Response, ctx: HttpRequestContext): Response | Promise<Response>;
}

export class UuidGuardInterceptor implements HttpInterceptor {
    onRequest(ctx: HttpRequestContext): HttpRequestContext {
        if (/(?:\/|=)(?:undefined|null)(?:\/|&|$)/.test(ctx.path)) {
            throw new ApiError("UUID inválido na requisição.", 400);
        }
        return ctx;
    }
}

export class AcceptLanguageInterceptor implements HttpInterceptor {
    constructor(private readonly localeProvider: ILocaleProvider) {}

    onRequest(ctx: HttpRequestContext): HttpRequestContext {
        if (!ctx.headers.has("Accept-Language")) {
            ctx.headers.set("Accept-Language", this.localeProvider.getBcp47Locale());
        }
        return ctx;
    }
}

export class AuthTokenInterceptor implements HttpInterceptor {
    constructor(private readonly tokenProvider: ITokenProvider) {}

    onRequest(ctx: HttpRequestContext): HttpRequestContext {
        const token = this.tokenProvider.getAccessToken();
        if (token && token !== "session-cookie-active" && !ctx.headers.has("Authorization")) {
            ctx.headers.set("Authorization", `Bearer ${token}`);
        }
        return ctx;
    }
}

export class ContentTypeInterceptor implements HttpInterceptor {
    onRequest(ctx: HttpRequestContext): HttpRequestContext {
        const isFormData = typeof FormData !== "undefined" && ctx.init.body instanceof FormData;
        if (!isFormData && ctx.init.body !== undefined && !ctx.headers.has("Content-Type")) {
            ctx.headers.set("Content-Type", "application/json");
        }
        return ctx;
    }
}

export class UnauthorizedResponseInterceptor implements HttpInterceptor {
    constructor(private readonly eventBus: IEventBus) {}

    onResponse(response: Response, ctx: HttpRequestContext): Response {
        if (response.status === 401 && !ctx.path.startsWith("/auth/login") && !ctx.path.startsWith("/auth/me")) {
            this.eventBus.emit("auth:unauthorized", { path: ctx.path });
            throw new ApiError("Sessão expirada", 401);
        }
        return response;
    }
}

export class FetchHttpClient implements IHttpClient {
    constructor(
        private readonly baseUrl: string,
        private readonly interceptors: readonly HttpInterceptor[] = [],
        private readonly fetchImpl: typeof fetch = (...args) => fetch(...args),
    ) {}

    private serializeBody(body: unknown): BodyInit | undefined {
        if (body === undefined) return undefined;
        if (typeof FormData !== "undefined" && body instanceof FormData) return body;
        if (typeof body === "string") return body;
        return JSON.stringify(body);
    }

    async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const headers = new Headers(options.headers);
        let ctx: HttpRequestContext = {
            path,
            url: `${this.baseUrl}${path}`,
            init: { ...options, credentials: options.credentials ?? "include" },
            headers,
        };

        for (const interceptor of this.interceptors) {
            if (interceptor.onRequest) {
                ctx = await interceptor.onRequest(ctx);
            }
        }

        let response = await this.fetchImpl(ctx.url, {
            ...ctx.init,
            headers: ctx.headers,
        });

        for (const interceptor of this.interceptors) {
            if (interceptor.onResponse) {
                response = await interceptor.onResponse(response, ctx);
            }
        }

        const contentType = response.headers.get("content-type") || "";
        const payload =
            response.status === 204
                ? null
                : contentType.includes("application/json")
                  ? await response.json().catch(() => null)
                  : await response.json().catch(() => null);

        if (!response.ok) {
            const rawMsg = payload?.message;
            const message = Array.isArray(rawMsg)
                ? rawMsg.join(" ")
                : rawMsg || `Erro na requisição (${response.status})`;
            throw new ApiError(message, response.status, payload);
        }

        return payload as T;
    }

    get<T>(path: string, options?: RequestInit): Promise<T> {
        return this.request<T>(path, { ...options, method: "GET" });
    }

    post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "POST",
            body: this.serializeBody(body),
        });
    }

    patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "PATCH",
            body: this.serializeBody(body),
        });
    }

    delete<T>(path: string, options?: RequestInit): Promise<T> {
        return this.request<T>(path, { ...options, method: "DELETE" });
    }
}
