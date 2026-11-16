import { ApiError } from "../services/api";

// RF30 - Helpers puros do dashboard de faturamento (formatação, período e erros).

export const MAX_PERIOD_DAYS = 366;

export type PeriodPresetId = "last7" | "last30" | "currentMonth" | "previousMonth";

export interface PeriodRange {
    from: string;
    to: string;
}

export interface PeriodPreset {
    id: PeriodPresetId;
    label: string;
}

export const PERIOD_PRESETS: PeriodPreset[] = [
    { id: "last7", label: "Últimos 7 dias" },
    { id: "last30", label: "Últimos 30 dias" },
    { id: "currentMonth", label: "Mês atual" },
    { id: "previousMonth", label: "Mês anterior" },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const DAY_MS = 24 * 60 * 60 * 1000;

export const formatCurrency = (value: number): string => currencyFormatter.format(value);

export const formatPercent = (value: number): string => `${percentFormatter.format(value)}%`;

/** Variação vs período anterior: "+12,5%", "-3%", ou texto de ausência de base (null ≠ 0). */
export const formatVariation = (value: number | null): string => {
    if (value === null) return "sem base de comparação";
    const sign = value > 0 ? "+" : "";
    return `${sign}${formatPercent(value)}`;
};

export type VariationTrend = "up" | "down" | "flat" | "none";

export const variationTrend = (value: number | null): VariationTrend => {
    if (value === null) return "none";
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "flat";
};

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' sem passar por Date (evita deslocamento de fuso). */
export const formatIsoDate = (iso: string): string => {
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
};

/** 'YYYY-MM-DD' -> 'DD/MM'. */
export const formatShortDate = (iso: string): string => {
    const [, month, day] = iso.split("-");
    return `${day}/${month}`;
};

/** Data local (fuso do navegador) em 'YYYY-MM-DD'. */
export const toIsoDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseIsoDate = (iso: string): number | null => {
    if (!ISO_DATE_RE.test(iso)) return null;
    const [year, month, day] = iso.split("-").map(Number);
    const time = Date.UTC(year, month - 1, day);
    const check = new Date(time);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
        return null;
    }
    return time;
};

export const resolvePreset = (preset: PeriodPresetId, today: Date = new Date()): PeriodRange => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    switch (preset) {
        case "last7":
            return { from: toIsoDate(new Date(y, m, d - 6)), to: toIsoDate(today) };
        case "last30":
            return { from: toIsoDate(new Date(y, m, d - 29)), to: toIsoDate(today) };
        case "previousMonth":
            return { from: toIsoDate(new Date(y, m - 1, 1)), to: toIsoDate(new Date(y, m, 0)) };
        case "currentMonth":
        default:
            return { from: toIsoDate(new Date(y, m, 1)), to: toIsoDate(new Date(y, m + 1, 0)) };
    }
};

/** Mesmas regras do back (from/to válidos, to >= from, até 366 dias). Retorna a mensagem ou null. */
export const validatePeriod = (range: PeriodRange): string | null => {
    const from = parseIsoDate(range.from);
    if (from === null) return "A data inicial (from) deve ser uma data válida no formato YYYY-MM-DD.";

    const to = parseIsoDate(range.to);
    if (to === null) return "A data final (to) deve ser uma data válida no formato YYYY-MM-DD.";

    if (to < from) return "A data final (to) deve ser maior ou igual à data inicial (from).";

    const days = Math.round((to - from) / DAY_MS) + 1;
    if (days > MAX_PERIOD_DAYS) return `O período selecionado deve ter no máximo ${MAX_PERIOD_DAYS} dias.`;

    return null;
};

/** Mensagem amigável a partir de um erro da API (o Nest pode devolver `message` como array). */
export const extractErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        const payload: unknown = error.data;
        if (payload && typeof payload === "object" && "message" in payload) {
            const message = (payload as { message: unknown }).message;
            if (Array.isArray(message)) return message.join(" ");
            if (typeof message === "string" && message) return message;
        }
        if (error.status === 403) return "Você não tem permissão para acessar o dashboard desta empresa.";
        return error.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return "Não foi possível carregar o dashboard.";
};

export const initialsOf = (name: string): string =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "?";
