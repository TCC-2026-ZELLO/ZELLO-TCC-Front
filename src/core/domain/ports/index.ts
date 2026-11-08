import type {
    AccountRole,
    Appointment,
    AvailabilityQuery,
    Bcp47Locale,
    BusinessContext,
    BusinessProfileData,
    ClientReputation,
    ExchangeRates,
    LanguageCode,
    OperatingHour,
    ProfessionalProfile,
    Qualification,
    ScheduleException,
    ServiceCatalogItem,
    ShiftInterval,
    TeamMemberLink,
    TimeBound,
    User,
} from "../entities/models";
import type { AddressSearchResult, GeolocationCoordinates } from "../../../types/location";

export interface DomainEventMap {
    "auth:unauthorized": { path: string };
    "auth:authenticated": { user: User };
    "auth:logout": undefined;
    "profile:switched": { role: AccountRole; business: BusinessContext | null };
    "toast:notify": { type: "success" | "error" | "info" | "warning"; message: string };
}

export interface IEventBus {
    on<K extends keyof DomainEventMap>(
        event: K,
        handler: (payload: DomainEventMap[K]) => void,
    ): () => void;
    emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void;
}

export interface IStorageGateway {
    get<T>(key: string): T | null;
    set<T>(key: string, value: T): void;
    remove(key: string): void;
    removeMany(keys: readonly string[]): void;
}

export interface ITokenProvider {
    getAccessToken(): string | null;
}

export interface ILocaleProvider {
    getLanguage(): LanguageCode;
    getBcp47Locale(): Bcp47Locale;
}

export interface IHttpClient {
    get<T>(path: string, options?: RequestInit): Promise<T>;
    post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T>;
    patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T>;
    delete<T>(path: string, options?: RequestInit): Promise<T>;
}

export interface IAuthRepository {
    login(credentials: { email: string; password: string }): Promise<{ user: User }>;
    logout(): Promise<void>;
    getCurrentSession(): Promise<{ user: User } | null>;
    requestPasswordRecovery(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    fetchManagedBusinesses(): Promise<BusinessContext[]>;
}

export interface IUserRepository {
    register(formData: FormData): Promise<unknown>;
    updateBasicInfo(userId: string, data: { nome?: string; name?: string }): Promise<User>;
    updateReminderPreferences(
        userId: string,
        prefs: { wantsEmailReminders: boolean; wantsWhatsappReminders: boolean },
    ): Promise<void>;
    changePassword(
        userId: string,
        payload: { currentPassword: string; password: string },
    ): Promise<void>;
    appendProfile(type: "client" | "professional" | "manager"): Promise<User>;
}

export interface CreateAppointmentCommand {
    professionalId?: string;
    businessId: string;
    serviceId: string;
    date: string;
    startTime: string;
}

export interface RescheduleCommand {
    date: string;
    startTime: string;
}

export interface ListAppointmentsQuery {
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    businessId?: string;
    professionalId?: string;
}

export interface IAppointmentRepository {
    create(command: CreateAppointmentCommand): Promise<Appointment>;
    getMyAppointments(): Promise<Appointment[]>;
    getByBusiness(businessId: string): Promise<Appointment[]>;
    list(query: ListAppointmentsQuery): Promise<Appointment[]>;
    cancel(id: string): Promise<Appointment>;
    cancelJustified(id: string, reason: string, affectsReputation: boolean): Promise<Appointment>;
    updateStatus(id: string, status: string): Promise<Appointment>;
    reschedule(id: string, data: RescheduleCommand): Promise<Appointment>;
    proposeReschedule(id: string, data: RescheduleCommand): Promise<Appointment>;
    respondToProposal(id: string, accept: boolean): Promise<Appointment>;
    markNoShow(id: string): Promise<Appointment>;
    revertNoShow(id: string): Promise<Appointment>;
    getClientReputation(clientId: string): Promise<ClientReputation>;
}

export interface IAvailabilityRepository {
    getBounds(query: AvailabilityQuery): Promise<TimeBound[]>;
    getCachedBounds?(query: AvailabilityQuery): TimeBound[] | undefined;
    refreshBounds?(query: AvailabilityQuery): Promise<TimeBound[]>;
    invalidateBounds?(query?: AvailabilityQuery): void;
    getOperatingHours(businessId: string): Promise<OperatingHour[]>;
    saveOperatingHour(data: OperatingHour): Promise<unknown>;
    saveShift(data: {
        businessProfessionalId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }): Promise<unknown>;
    createException(data: {
        businessId?: string;
        professionalId?: string;
        date?: string;
        dates?: string[];
        startTime: string;
        endTime: string;
        reason: string;
        forceOverwritePending?: boolean;
        skipConflicts?: boolean;
    }): Promise<unknown>;
    getExceptions(params?: {
        professionalId?: string;
        businessId?: string;
        date?: string;
    }): Promise<ScheduleException[]>;
    deleteException(id: string): Promise<unknown>;
}

export interface IBusinessProfileRepository {
    getById(id: string): Promise<BusinessProfileData>;
    updateProfile(id: string, data: Record<string, unknown>): Promise<unknown>;
}

export interface IBusinessMediaRepository {
    getGallery(id: string): Promise<Array<{ id: string; url: string }>>;
    updatePhoto(id: string, file: File): Promise<unknown>;
    updateBanner(id: string, file: File): Promise<unknown>;
    addGalleryImage(id: string, file: File): Promise<unknown>;
    deleteGalleryImage(businessId: string, imageId: string): Promise<unknown>;
}

export interface IBusinessTeamRepository {
    listByBusiness(businessId: string): Promise<TeamMemberLink[]>;
    linkProfessional(data: { businessId: string; email: string; active: boolean }): Promise<unknown>;
    unlinkProfessional(linkId: string): Promise<unknown>;
    updateLink(linkId: string, data: Record<string, unknown>): Promise<unknown>;
    getAssignedServices(linkId: string): Promise<ServiceCatalogItem[]>;
    updateAssignedServices(linkId: string, serviceIds: string[]): Promise<unknown>;
    getShifts(linkId: string): Promise<ShiftInterval[]>;
    updateShifts(linkId: string, shifts: ShiftInterval[]): Promise<unknown>;
}

export interface ICatalogRepository {
    listByBusiness(businessId: string): Promise<ServiceCatalogItem[]>;
    create(businessId: string, item: Omit<ServiceCatalogItem, "id">): Promise<ServiceCatalogItem>;
    update(id: string, item: Partial<ServiceCatalogItem>): Promise<ServiceCatalogItem>;
    delete(id: string): Promise<void>;
}

export interface IProfessionalRepository {
    getPublicProfile(id: string): Promise<ProfessionalProfile>;
    getServices(id: string): Promise<any[]>;
    getPortfolio(id: string): Promise<any[]>;
    getQualifications(id: string): Promise<Qualification[]>;
    updateProfile(data: { bio?: string; specialty?: string; visibilityStatus?: boolean }): Promise<unknown>;
    updateAvatar(file: File): Promise<unknown>;
    updateBanner(file: File): Promise<unknown>;
    uploadPortfolioImage(file: File): Promise<unknown>;
    deletePortfolioImage(id: string): Promise<unknown>;
    addQualification(data: {
        file: File;
        title: string;
        institution?: string;
        approvement?: number;
        type?: string;
        year?: number;
    }): Promise<unknown>;
    updateQualification(
        id: string,
        data: {
            file?: File;
            title?: string;
            institution?: string;
            approvement?: number;
            type?: string;
            year?: number;
        },
    ): Promise<unknown>;
    deleteQualification(id: string): Promise<unknown>;
}

export interface ISearchRepository {
    searchProfessionals(
        query: string,
        filters?: {
            sortBy?: "default" | "trending" | "price_asc";
            minPrice?: number;
            maxPrice?: number;
            minRating?: number;
            limit?: number;
        },
    ): Promise<any[]>;
    searchBusinesses(query: string): Promise<any[]>;
    getRecommendedProfessionals(): Promise<any[]>;
}

export interface IGeocodingGateway {
    searchAddress(query: string): Promise<AddressSearchResult | null>;
}

export interface IGeolocationGateway {
    isSupported(): boolean;
    getCurrentPosition(options?: PositionOptions): Promise<GeolocationCoordinates>;
}

export interface IExchangeRateGateway {
    getRates(): ExchangeRates;
    refreshRates(): Promise<ExchangeRates>;
}
