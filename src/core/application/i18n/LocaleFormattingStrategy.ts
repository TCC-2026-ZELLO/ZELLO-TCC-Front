import type {
    Bcp47Locale,
    CurrencyCode,
    ExchangeRates,
    LanguageCode,
} from "../../domain/entities/models";
import { FALLBACK_EXCHANGE_RATES } from "../../infrastructure/gateways/ExternalGateways";

const KM_TO_MILES = 0.621371;

export interface LocaleFormattingStrategy {
    readonly language: LanguageCode;
    readonly bcp47: Bcp47Locale;
    readonly currency: CurrencyCode;
    readonly distanceUnit: "kilometer" | "mile";
    readonly distanceShortLabel: "km" | "mi";
    readonly use12HourClock: boolean;

    formatDate(isoOrDate: string | Date): string;
    formatShortDate(isoOrDate: string | Date): string;
    formatTime(hhmm: string): string;
    formatDecimal(value: number, digits?: number): string;
    formatInteger(value: number): string;
    formatPercent(percentValue: number): string;
    formatDistance(distanceKm: number, digits?: number): string;
    formatDistanceLong(distanceKm: number, digits?: number): string;
    convertFromBrl(amountBrl: number, rates?: ExchangeRates): number;
    convertToBrl(amountInLocaleCurrency: number, rates?: ExchangeRates): number;
    formatMoney(amountBrl: number, rates?: ExchangeRates): string;
    formatBrlBaseHint(amountBrl: number): string | null;
}

function parseSafeDate(isoOrDate: string | Date): Date | null {
    if (isoOrDate instanceof Date) {
        return Number.isNaN(isoOrDate.getTime()) ? null : isoOrDate;
    }
    if (!isoOrDate) return null;
    const raw = String(isoOrDate).trim();
    const d = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

abstract class BaseIntlFormattingStrategy implements LocaleFormattingStrategy {
    abstract readonly language: LanguageCode;
    abstract readonly bcp47: Bcp47Locale;
    abstract readonly currency: CurrencyCode;
    abstract readonly distanceUnit: "kilometer" | "mile";
    abstract readonly distanceShortLabel: "km" | "mi";
    abstract readonly use12HourClock: boolean;

    formatDate(isoOrDate: string | Date): string {
        const d = parseSafeDate(isoOrDate);
        if (!d) return String(isoOrDate ?? "");
        return new Intl.DateTimeFormat(this.bcp47, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(d);
    }

    formatShortDate(isoOrDate: string | Date): string {
        const d = parseSafeDate(isoOrDate);
        if (!d) return String(isoOrDate ?? "");
        return new Intl.DateTimeFormat(this.bcp47, {
            day: "2-digit",
            month: "short",
        }).format(d);
    }

    formatTime(hhmm: string): string {
        if (!hhmm || !hhmm.includes(":")) return hhmm || "";
        const [hStr, mStr] = hhmm.split(":");
        const hours = Number(hStr);
        const mins = Number(mStr);
        if (Number.isNaN(hours) || Number.isNaN(mins)) return hhmm;

        const ref = new Date(2026, 0, 1, hours, mins, 0);
        return new Intl.DateTimeFormat(this.bcp47, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: this.use12HourClock,
        }).format(ref);
    }

    formatDecimal(value: number, digits = 1): string {
        const safe = Number(value ?? 0);
        return new Intl.NumberFormat(this.bcp47, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        }).format(Number.isNaN(safe) ? 0 : safe);
    }

    formatInteger(value: number): string {
        const safe = Math.round(Number(value ?? 0));
        return new Intl.NumberFormat(this.bcp47, {
            maximumFractionDigits: 0,
        }).format(Number.isNaN(safe) ? 0 : safe);
    }

    formatPercent(percentValue: number): string {
        const safe = Number(percentValue ?? 0) / 100;
        return new Intl.NumberFormat(this.bcp47, {
            style: "percent",
            maximumFractionDigits: 0,
        }).format(Number.isNaN(safe) ? 0 : safe);
    }

    formatDistance(distanceKm: number, digits = 1): string {
        const raw = Number(distanceKm ?? 0);
        const converted = this.distanceUnit === "mile" ? raw * KM_TO_MILES : raw;
        return `${this.formatDecimal(converted, digits)} ${this.distanceShortLabel}`;
    }

    formatDistanceLong(distanceKm: number, digits = 1): string {
        const raw = Number(distanceKm ?? 0);
        const converted = this.distanceUnit === "mile" ? raw * KM_TO_MILES : raw;
        try {
            return new Intl.NumberFormat(this.bcp47, {
                style: "unit",
                unit: this.distanceUnit,
                unitDisplay: "long",
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
            }).format(converted);
        } catch {
            return this.formatDistance(distanceKm, digits);
        }
    }

    convertFromBrl(amountBrl: number, rates: ExchangeRates = FALLBACK_EXCHANGE_RATES): number {
        const safe = Number(amountBrl ?? 0);
        if (Number.isNaN(safe)) return 0;
        const rate = rates[this.currency] ?? 1;
        return safe * rate;
    }

    convertToBrl(
        amountInLocaleCurrency: number,
        rates: ExchangeRates = FALLBACK_EXCHANGE_RATES,
    ): number {
        const safe = Number(amountInLocaleCurrency ?? 0);
        if (Number.isNaN(safe)) return 0;
        const rate = rates[this.currency] ?? 1;
        return rate > 0 ? safe / rate : safe;
    }

    formatMoney(amountBrl: number, rates: ExchangeRates = FALLBACK_EXCHANGE_RATES): string {
        const converted = this.convertFromBrl(amountBrl, rates);
        return new Intl.NumberFormat(this.bcp47, {
            style: "currency",
            currency: this.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(converted);
    }

    formatBrlBaseHint(amountBrl: number): string | null {
        if (this.currency === "BRL") return null;
        const baseFormatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(Number(amountBrl ?? 0));
        return `≈ ${baseFormatted}`;
    }
}

export class PtBrFormattingStrategy extends BaseIntlFormattingStrategy {
    readonly language = "PT" as const;
    readonly bcp47 = "pt-BR" as const;
    readonly currency = "BRL" as const;
    readonly distanceUnit = "kilometer" as const;
    readonly distanceShortLabel = "km" as const;
    readonly use12HourClock = false;
}

export class EnUsFormattingStrategy extends BaseIntlFormattingStrategy {
    readonly language = "EN" as const;
    readonly bcp47 = "en-US" as const;
    readonly currency = "USD" as const;
    readonly distanceUnit = "mile" as const;
    readonly distanceShortLabel = "mi" as const;
    readonly use12HourClock = true;
}

export class EsEsFormattingStrategy extends BaseIntlFormattingStrategy {
    readonly language = "ES" as const;
    readonly bcp47 = "es-ES" as const;
    readonly currency = "EUR" as const;
    readonly distanceUnit = "kilometer" as const;
    readonly distanceShortLabel = "km" as const;
    readonly use12HourClock = false;
}

const LOCALE_STRATEGIES: Record<LanguageCode, LocaleFormattingStrategy> = {
    PT: new PtBrFormattingStrategy(),
    EN: new EnUsFormattingStrategy(),
    ES: new EsEsFormattingStrategy(),
};

export function getLocaleStrategy(language: LanguageCode): LocaleFormattingStrategy {
    return LOCALE_STRATEGIES[language] ?? LOCALE_STRATEGIES.PT;
}
