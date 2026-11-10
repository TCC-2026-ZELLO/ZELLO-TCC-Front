import { DomainDataLocalizer } from "../application/i18n/DomainDataLocalizer";
import {
    getLocaleStrategy,
    type LocaleFormattingStrategy,
} from "../application/i18n/LocaleFormattingStrategy";
import {
    DICTIONARIES,
    exchangeRates,
    idioma,
    setIdioma,
    setLanguage,
    t,
    type Language,
} from "../../store/appState";
import type { TranslationDictionary } from "./locales/pt";

export { DICTIONARIES as translations, idioma, setIdioma, setLanguage, t };
export type { Language, LocaleFormattingStrategy, TranslationDictionary };

export const localeStrategy = (): LocaleFormattingStrategy => getLocaleStrategy(idioma());

export const formatDate = (isoOrDate: string | Date): string =>
    localeStrategy().formatDate(isoOrDate);

export const formatShortDate = (isoOrDate: string | Date): string =>
    localeStrategy().formatShortDate(isoOrDate);

export const formatTime = (hhmm: string): string => localeStrategy().formatTime(hhmm);

export const formatDecimal = (value: number, digits = 1): string =>
    localeStrategy().formatDecimal(value, digits);

export const formatInteger = (value: number): string => localeStrategy().formatInteger(value);

export const formatPercent = (percentValue: number): string =>
    localeStrategy().formatPercent(percentValue);

export const formatDistance = (distanceKm: number, digits = 1): string =>
    localeStrategy().formatDistance(distanceKm, digits);

export const formatDistanceLong = (distanceKm: number, digits = 1): string =>
    localeStrategy().formatDistanceLong(distanceKm, digits);

export const formatMoney = (amountBrl: number): string =>
    localeStrategy().formatMoney(amountBrl, exchangeRates());

export const formatMoneyHint = (amountBrl: number): string | null =>
    localeStrategy().formatBrlBaseHint(amountBrl);

export const convertMoneyFromBrl = (amountBrl: number): number =>
    localeStrategy().convertFromBrl(amountBrl, exchangeRates());

export const convertMoneyToBrl = (amountInActiveCurrency: number): number =>
    localeStrategy().convertToBrl(amountInActiveCurrency, exchangeRates());

export const localizeDomain = {
    category: (raw?: string | null) => DomainDataLocalizer.category(raw, idioma()),
    specialty: (raw?: string | null) => DomainDataLocalizer.specialty(raw, idioma()),
    segment: (raw?: string | null) => DomainDataLocalizer.segment(raw, idioma()),
    qualificationType: (raw?: string | null) =>
        DomainDataLocalizer.qualificationType(raw, idioma()),
    role: (raw?: string | null) => DomainDataLocalizer.role(raw, idioma()),
    dayShort: (dayZeroSun: number) => DomainDataLocalizer.dayShort(dayZeroSun, idioma()),
    serviceName: (raw?: string | null) => DomainDataLocalizer.serviceName(raw, idioma()),
    serviceList: (csv?: string | null) => DomainDataLocalizer.serviceList(csv, idioma()),
    apiError: (msg?: string | null, fallback = "") =>
        DomainDataLocalizer.apiError(msg, idioma(), fallback),
};
