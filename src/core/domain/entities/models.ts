export type LanguageCode = "PT" | "EN" | "ES";
export type Bcp47Locale = "pt-BR" | "en-US" | "es-ES";
export type CurrencyCode = "BRL" | "USD" | "EUR";
export type ThemeMode = "light" | "dark" | "high-contrast";

export type AccountRole = "cliente" | "profissional" | "estabelecimento";
export type AccountType = "CLIENTE" | "PROFISSIONAL" | "ESTABELECIMENTO";
export type BackendRole = "client" | "professional" | "manager";

export type AppointmentStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED"
    | "NO_SHOW";

export type QualificationType =
    | "diploma"
    | "specialization"
    | "course"
    | "certification";

export interface ExchangeRates {
    BRL: number;
    USD: number;
    EUR: number;
    updatedAt?: string;
}

export interface BusinessContext {
    linkId: string;
    businessId: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    client?: { id: string };
    professional?: { id: string };
    manager?: { id: string };
    provider?: string;
    wantsEmailReminders?: boolean;
    wantsWhatsappReminders?: boolean;
}

export interface TimeBound {
    start: string;
    end: string;
    durationAvailable: number;
}

export interface AvailabilityQuery {
    date: string;
    professionalId?: string;
    businessId: string;
    serviceId: string;
}

export interface ServiceCatalogItem {
    id: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    durationMinutes: number;
    cleanupMinutes: number;
    active: boolean;
}

export interface Qualification {
    id: string;
    title: string;
    institution?: string;
    approvement?: number;
    type: QualificationType | string;
    year?: number;
    certificateUrl?: string;
}

export interface ProfessionalProfile {
    id: string;
    userId?: string;
    name: string;
    email?: string;
    specialty?: string;
    biography?: string;
    city?: string;
    photoUrl?: string;
    bannerUrl?: string;
    visibilityStatus?: boolean;
    averageRating?: number;
    rating?: number;
    reviewCount?: number;
    minPrice?: number;
    user?: { id?: string; name: string; email?: string };
}

export interface BusinessProfileData {
    id: string;
    tradeName: string;
    name?: string;
    segment?: string;
    description?: string;
    city?: string;
    photoUrl?: string;
    bannerUrl?: string;
    visibilityStatus?: boolean;
    profileComplete?: boolean;
    averageRating?: number;
    rating?: number;
    reviewCount?: number;
    minPrice?: number;
    galleryImages?: Array<{ id: string; url: string }>;
}

export interface ShiftInterval {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface TeamMemberLink {
    id: string;
    businessId: string;
    professionalId?: string;
    active: boolean;
    professional: {
        id: string;
        specialty?: string;
        photoUrl?: string;
        user?: {
            id?: string;
            name: string;
            email?: string;
        };
    };
}

export interface Appointment {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    rescheduleCount: number;
    proposedDate?: string | null;
    proposedStartTime?: string | null;
    cancelledByRole?: string | null;
    professionalId?: string;
    businessId?: string;
    serviceId?: string;
    client?: {
        id: string;
        name?: string;
        user?: { name?: string };
    };
    professional?: {
        id: string;
        user?: { name?: string };
    };
    business?: {
        id: string;
        tradeName?: string;
    };
    service?: {
        id: string;
        name: string;
        price?: number;
        durationMinutes?: number;
        cleanupMinutes?: number;
    };
}

export interface ClientReputation {
    noShowCount: number;
    successStreak: number;
}

export interface OperatingHour {
    id?: string;
    businessId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    lunchStart?: string;
    lunchEnd?: string;
    isOpen: boolean;
}

export interface ScheduleException {
    id: string;
    businessId?: string;
    professionalId?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    professional?: {
        id: string;
        user?: { name?: string };
    } | null;
}

export interface WidgetPreference {
    id: string;
    enabled: boolean;
    order: number;
}

export interface SavedFilterPreset {
    id: string;
    name: string;
    values: Record<string, string | number | boolean | string[] | undefined>;
    isDefault?: boolean;
    createdAt: string;
}

export interface ScreenCustomizationConfig {
    screenId: string;
    viewMode: "grid" | "cards" | "table" | "compact";
    density: "comfortable" | "compact";
    visibleColumns: string[];
    widgets: WidgetPreference[];
    presets: SavedFilterPreset[];
    activePresetId?: string | null;
    updatedAt: string;
}
