/**
 * v5.0.0-1.2.2 / 3.2.2: valida URLs vindas da API antes de usá-las em `href`
 * ou `src`. Só são aceitos os protocolos https: e http: (e blob: para
 * pré-visualizações locais). Qualquer outro esquema, como javascript:, data:
 * ou vbscript:, é descartado.
 */
const ALLOWED_PROTOCOLS = new Set(["https:", "http:", "blob:"]);

export function safeUrl(value: string | null | undefined, fallback = "#"): string {
    if (!value || typeof value !== "string") return fallback;
    try {
        const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
        const parsed = new URL(value, base);
        return ALLOWED_PROTOCOLS.has(parsed.protocol) ? parsed.href : fallback;
    } catch {
        return fallback;
    }
}
