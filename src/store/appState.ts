import { batch, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { getLocaleStrategy } from "../core/application/i18n/LocaleFormattingStrategy";
import { eventBus, exchangeRateGateway, storage } from "../core/bootstrap";
import type {
    AccountRole,
    AccountType,
    BusinessContext,
    ExchangeRates,
    LanguageCode,
    ThemeMode,
    User,
} from "../core/domain/entities/models";
import { RoleAccessPolicy } from "../core/domain/policies/RoleAccessPolicy";
import { en } from "../core/i18n/locales/en";
import { es } from "../core/i18n/locales/es";
import { pt, type TranslationDictionary } from "../core/i18n/locales/pt";
import {
    AUTH_SESSION_KEYS,
    STORAGE_KEYS,
} from "../core/infrastructure/storage/StorageAdapters";

export type { AccountRole, AccountType, BusinessContext, LanguageCode, ThemeMode, User };
export type Language = LanguageCode;

export const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const DICTIONARIES: Record<LanguageCode, TranslationDictionary> = {
    PT: pt,
    EN: en,
    ES: es,
};

const VALID_THEMES: readonly ThemeMode[] = ["light", "dark", "high-contrast"];
const VALID_LANGUAGES: readonly LanguageCode[] = ["PT", "EN", "ES"];

function readInitialLanguage(): LanguageCode {
    const saved = storage.get<string>(STORAGE_KEYS.LANGUAGE);
    if (saved && (VALID_LANGUAGES as readonly string[]).includes(saved)) {
        return saved as LanguageCode;
    }
    return "PT";
}

function readInitialTheme(): ThemeMode {
    const saved = storage.get<string>(STORAGE_KEYS.THEME);
    if (saved && (VALID_THEMES as readonly string[]).includes(saved)) {
        return saved as ThemeMode;
    }
    return "light";
}

export const [isSidebarCollapsed, setIsSidebarCollapsed] = createSignal(false);
export const [isMobileSidebarOpen, setIsMobileSidebarOpen] = createSignal(false);
export const [idioma, setIdiomaSignal] = createSignal<LanguageCode>(readInitialLanguage());
export const [theme, setThemeSignal] = createSignal<ThemeMode>(readInitialTheme());
export const [exchangeRates, setExchangeRates] = createSignal<ExchangeRates>(
    exchangeRateGateway.getRates(),
);
export const [isMounted, setIsMounted] = createSignal(false);

export const [currentUser, setCurrentUser] = createSignal<User | null>(null);
export const [accessToken, setAccessToken] = createSignal<string | null>(null);
export const [accountRole, setAccountRole] = createSignal<AccountRole>("cliente");

export const [managedBusinesses, setManagedBusinesses] = createSignal<BusinessContext[]>([]);
export const [activeBusiness, setActiveBusiness] = createSignal<BusinessContext | null>(null);

export const getUserId = () => currentUser()?.id;
export const getClientId = () => currentUser()?.client?.id || currentUser()?.id;
export const getProId = () => currentUser()?.professional?.id;
export const getManagerId = () => currentUser()?.manager?.id;
export const getActiveBizId = () => activeBusiness()?.businessId;

function applyDomTheme(mode: ThemeMode): void {
    if (isServer || typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode === "light" ? "light" : "dark";
}

function applyDomLanguage(lang: LanguageCode): void {
    if (isServer || typeof document === "undefined") return;
    const bcp47 = getLocaleStrategy(lang).bcp47;
    document.documentElement.setAttribute("lang", bcp47);
}

export function setLanguage(lang: LanguageCode): void {
    if (!(VALID_LANGUAGES as readonly string[]).includes(lang)) return;
    setIdiomaSignal(lang);
    storage.set(STORAGE_KEYS.LANGUAGE, lang);
    applyDomLanguage(lang);
}

export const setIdioma = (next: LanguageCode | ((prev: LanguageCode) => LanguageCode)): void => {
    const resolved = typeof next === "function" ? next(idioma()) : next;
    setLanguage(resolved);
};

export function setThemeMode(mode: ThemeMode): void {
    if (!(VALID_THEMES as readonly string[]).includes(mode)) return;
    setThemeSignal(mode);
    storage.set(STORAGE_KEYS.THEME, mode);
    applyDomTheme(mode);
}

export const setTheme = (next: ThemeMode | ((prev: ThemeMode) => ThemeMode)): void => {
    const resolved = typeof next === "function" ? next(theme()) : next;
    setThemeMode(resolved);
};

export const toggleTheme = (): ThemeMode => {
    const current = theme();
    const idx = VALID_THEMES.indexOf(current);
    const next = VALID_THEMES[(idx + 1) % VALID_THEMES.length];
    setThemeMode(next);
    return next;
};

export function persistAuthSession(params: {
    user: User;
    token?: string;
    role?: AccountRole;
    businesses?: BusinessContext[];
    selectedBusiness?: BusinessContext | null;
}): void {
    const token = params.token ?? "session-cookie-active";
    const resolvedRole = params.role ?? RoleAccessPolicy.resolvePrimaryRole(params.user.roles);

    batch(() => {
        setCurrentUser(params.user);
        setAccessToken(token);
        setAccountRole(resolvedRole);
        if (params.businesses !== undefined) {
            setManagedBusinesses(params.businesses);
        }
        if (params.selectedBusiness !== undefined) {
            setActiveBusiness(params.selectedBusiness);
        }
    });

    storage.set(STORAGE_KEYS.USER, params.user);
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    storage.set(STORAGE_KEYS.ACCOUNT_ROLE, resolvedRole);
    if (params.businesses !== undefined) {
        storage.set(STORAGE_KEYS.MANAGED_BUSINESSES, params.businesses);
    }
    if (params.selectedBusiness !== undefined) {
        if (params.selectedBusiness) {
            storage.set(STORAGE_KEYS.ACTIVE_BUSINESS, params.selectedBusiness);
        } else {
            storage.remove(STORAGE_KEYS.ACTIVE_BUSINESS);
        }
    }
}

export function switchProfileRole(role: AccountRole): void {
    setAccountRole(role);
    storage.set(STORAGE_KEYS.ACCOUNT_ROLE, role);
    eventBus.emit("profile:switched", {
        role,
        business: activeBusiness(),
    });
}

export function switchActiveBusiness(biz: BusinessContext): void {
    batch(() => {
        setActiveBusiness(biz);
        setAccountRole("estabelecimento");
    });
    storage.set(STORAGE_KEYS.ACTIVE_BUSINESS, biz);
    storage.set(STORAGE_KEYS.ACCOUNT_ROLE, "estabelecimento");
    eventBus.emit("profile:switched", {
        role: "estabelecimento",
        business: biz,
    });
}

export function clearAuthSession(): void {
    batch(() => {
        setAccessToken(null);
        setCurrentUser(null);
        setAccountRole("cliente");
        setManagedBusinesses([]);
        setActiveBusiness(null);
    });
    storage.removeMany(AUTH_SESSION_KEYS);
}

let listenersBound = false;

export function initializeStore(): void {
    if (isServer) return;

    const savedUser = storage.get<User>(STORAGE_KEYS.USER);
    const savedToken = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    const savedActiveBiz = storage.get<BusinessContext>(STORAGE_KEYS.ACTIVE_BUSINESS);
    const savedManagedBiz = storage.get<BusinessContext[]>(STORAGE_KEYS.MANAGED_BUSINESSES);
    const savedRole = storage.get<AccountRole>(STORAGE_KEYS.ACCOUNT_ROLE);
    const savedTheme = readInitialTheme();
    const savedLang = readInitialLanguage();

    batch(() => {
        if (savedUser && typeof savedUser === "object" && savedUser.id) {
            setCurrentUser(savedUser);
            setAccessToken(savedToken || "session-cookie-active");

            if (Array.isArray(savedManagedBiz)) {
                setManagedBusinesses(savedManagedBiz);
            }
            if (savedActiveBiz && typeof savedActiveBiz === "object") {
                setActiveBusiness(savedActiveBiz);
            }

            const availableRoles = RoleAccessPolicy.getAvailableRoles(savedUser.roles);
            if (savedRole && availableRoles.includes(savedRole)) {
                setAccountRole(savedRole);
            } else {
                setAccountRole(RoleAccessPolicy.resolvePrimaryRole(savedUser.roles ?? []));
            }
        }

        setThemeSignal(savedTheme);
        setIdiomaSignal(savedLang);
        setIsMounted(true);
    });

    applyDomTheme(savedTheme);
    applyDomLanguage(savedLang);

    if (!listenersBound) {
        listenersBound = true;
        eventBus.on("auth:unauthorized", () => {
            clearAuthSession();
        });
    }

    void exchangeRateGateway.refreshRates().then((fresh) => {
        setExchangeRates(fresh);
    });
}

export const toggleRole = () => {
    const nextRole = RoleAccessPolicy.nextRole(accountRole(), currentUser()?.roles);
    switchProfileRole(nextRole);
};

export const isDark = () => theme() === "dark";
export const isHighContrast = () => theme() === "high-contrast";
export const t = (): TranslationDictionary => DICTIONARIES[idioma()] ?? DICTIONARIES.PT;
export const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
export const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
export const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
export const isAuthenticated = () => !!currentUser() && !!accessToken();
