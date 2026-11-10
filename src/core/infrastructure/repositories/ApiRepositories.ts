import type {
    Appointment,
    AvailabilityQuery,
    BusinessContext,
    BusinessProfileData,
    ClientReputation,
    OperatingHour,
    ProfessionalProfile,
    Qualification,
    ScheduleException,
    ServiceCatalogItem,
    ShiftInterval,
    TeamMemberLink,
    TimeBound,
    User,
} from "../../domain/entities/models";
import type {
    CreateAppointmentCommand,
    IAppointmentRepository,
    IAuthRepository,
    IAvailabilityRepository,
    IBusinessMediaRepository,
    IBusinessProfileRepository,
    IBusinessTeamRepository,
    ICatalogRepository,
    IHttpClient,
    IProfessionalRepository,
    ISearchRepository,
    IUserRepository,
    ListAppointmentsQuery,
    RescheduleCommand,
} from "../../domain/ports";
import {
    AppointmentMapper,
    BusinessMapper,
    CatalogMapper,
    unwrapEnvelope,
    UserMapper,
} from "../mappers/DtoMappers";

export class HttpAuthRepository implements IAuthRepository {
    constructor(private readonly http: IHttpClient) {}

    async login(credentials: { email: string; password: string }): Promise<{ user: User }> {
        const raw = await this.http.post<any>("/auth/login", credentials);
        const unwrapped = unwrapEnvelope<any>(raw);
        return { user: UserMapper.toDomain(unwrapped?.user ?? unwrapped) };
    }

    async logout(): Promise<void> {
        await this.http.post("/auth/logout", {});
    }

    async getCurrentSession(): Promise<{ user: User } | null> {
        try {
            const raw = await this.http.get<any>("/auth/me");
            const unwrapped = unwrapEnvelope<any>(raw);
            const userCandidate = unwrapped?.user ?? unwrapped;
            if (!userCandidate?.id) return null;
            return { user: UserMapper.toDomain(userCandidate) };
        } catch {
            return null;
        }
    }

    async requestPasswordRecovery(email: string): Promise<void> {
        await this.http.post("/auth/forgot-password", { email });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await this.http.post("/auth/reset-password", { token, newPassword });
    }

    async fetchManagedBusinesses(): Promise<BusinessContext[]> {
        const raw = await this.http.get<any>("/businesses/me");
        return UserMapper.toBusinessContexts(raw);
    }
}

export class HttpUserRepository implements IUserRepository {
    constructor(private readonly http: IHttpClient) {}

    register(formData: FormData): Promise<unknown> {
        return this.http.post("/users", formData);
    }

    async updateBasicInfo(
        userId: string,
        data: { nome?: string; name?: string },
    ): Promise<User> {
        const raw = await this.http.patch<any>(`/users/${userId}`, data);
        return UserMapper.toDomain(raw);
    }

    async updateReminderPreferences(
        userId: string,
        prefs: { wantsEmailReminders: boolean; wantsWhatsappReminders: boolean },
    ): Promise<void> {
        await this.http.patch(`/users/${userId}`, prefs);
    }

    async changePassword(
        userId: string,
        payload: { currentPassword: string; password: string },
    ): Promise<void> {
        await this.http.patch(`/users/${userId}`, payload);
    }

    async appendProfile(type: "client" | "professional" | "manager"): Promise<User> {
        const raw = await this.http.post<any>(`/users/profiles/${type}`, {});
        return UserMapper.toDomain(raw);
    }
}

export class HttpAppointmentRepository implements IAppointmentRepository {
    constructor(private readonly http: IHttpClient) {}

    async create(command: CreateAppointmentCommand): Promise<Appointment> {
        const raw = await this.http.post<any>("/appointments", command);
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async getMyAppointments(): Promise<Appointment[]> {
        const raw = await this.http.get<any>("/appointments/me");
        return AppointmentMapper.toDomainList(raw);
    }

    async getByBusiness(businessId: string): Promise<Appointment[]> {
        const raw = await this.http.get<any>(`/appointments/business/${businessId}`);
        return AppointmentMapper.toDomainList(raw);
    }

    async list(query: ListAppointmentsQuery): Promise<Appointment[]> {
        const clean = Object.fromEntries(
            Object.entries(query).filter(([_, v]) => v !== undefined && v !== null && v !== ""),
        ) as Record<string, string>;
        const qs = new URLSearchParams(clean).toString();
        const raw = await this.http.get<any>(`/appointments${qs ? `?${qs}` : ""}`);
        return AppointmentMapper.toDomainList(raw);
    }

    async cancel(id: string): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/cancel`, {});
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async cancelJustified(
        id: string,
        reason: string,
        affectsReputation: boolean,
    ): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/cancel-justified`, {
            reason,
            affectsReputation,
        });
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async updateStatus(id: string, status: string): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/status`, { status });
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async reschedule(id: string, data: RescheduleCommand): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/reschedule`, data);
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async proposeReschedule(id: string, data: RescheduleCommand): Promise<Appointment> {
        const raw = await this.http.post<any>(`/appointments/${id}/reschedule-proposal`, data);
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async respondToProposal(id: string, accept: boolean): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/reschedule-proposal`, {
            accept,
        });
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async markNoShow(id: string): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/no-show`, {});
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async revertNoShow(id: string): Promise<Appointment> {
        const raw = await this.http.patch<any>(`/appointments/${id}/revert-no-show`, {});
        return AppointmentMapper.toDomain(unwrapEnvelope(raw));
    }

    async getClientReputation(clientId: string): Promise<ClientReputation> {
        const raw = await this.http.get<any>(`/appointments/client/${clientId}/reputation`);
        return AppointmentMapper.toReputation(raw);
    }
}

export class HttpAvailabilityRepository implements IAvailabilityRepository {
    constructor(private readonly http: IHttpClient) {}

    async getBounds(query: AvailabilityQuery): Promise<TimeBound[]> {
        const params: Record<string, string> = {
            businessId: query.businessId,
            serviceId: query.serviceId,
            date: query.date,
        };
        if (query.professionalId) params.professionalId = query.professionalId;
        const qs = new URLSearchParams(params).toString();
        const raw = await this.http.get<any>(`/availability/bounds?${qs}`);
        return unwrapEnvelope<TimeBound[]>(raw) ?? [];
    }

    async getOperatingHours(businessId: string): Promise<OperatingHour[]> {
        const raw = await this.http.get<any>(
            `/availability/operating-hours?businessId=${businessId}`,
        );
        const list = unwrapEnvelope<OperatingHour[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    saveOperatingHour(data: OperatingHour): Promise<unknown> {
        return this.http.post("/availability/operating-hours", data);
    }

    saveShift(data: {
        businessProfessionalId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }): Promise<unknown> {
        return this.http.post("/availability/shifts", data);
    }

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
    }): Promise<unknown> {
        return this.http.post("/availability/exceptions", data);
    }

    async getExceptions(params?: {
        professionalId?: string;
        businessId?: string;
        date?: string;
    }): Promise<ScheduleException[]> {
        const clean = params
            ? Object.fromEntries(
                  Object.entries(params).filter(
                      ([_, v]) => v !== undefined && v !== null && v !== "",
                  ),
              )
            : {};
        const qs = new URLSearchParams(clean as Record<string, string>).toString();
        const raw = await this.http.get<any>(`/availability/exceptions${qs ? `?${qs}` : ""}`);
        const list = unwrapEnvelope<ScheduleException[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    deleteException(id: string): Promise<unknown> {
        return this.http.delete(`/availability/exceptions/${id}`);
    }
}

export class HttpBusinessRepository
    implements IBusinessProfileRepository, IBusinessMediaRepository
{
    constructor(private readonly http: IHttpClient) {}

    async getById(id: string): Promise<BusinessProfileData> {
        const raw = await this.http.get<any>(`/businesses/${id}`);
        return BusinessMapper.toDomain(raw);
    }

    updateProfile(id: string, data: Record<string, unknown>): Promise<unknown> {
        return this.http.patch(`/businesses/${id}/profile`, data);
    }

    async getGallery(id: string): Promise<Array<{ id: string; url: string }>> {
        const raw = await this.http.get<any>(`/businesses/${id}/gallery`);
        const list = unwrapEnvelope<Array<{ id: string; url: string }>>(raw);
        return Array.isArray(list) ? list : [];
    }

    updatePhoto(id: string, file: File): Promise<unknown> {
        const formData = new FormData();
        formData.append("file", file);
        return this.http.post(`/businesses/${id}/photo`, formData);
    }

    updateBanner(id: string, file: File): Promise<unknown> {
        const formData = new FormData();
        formData.append("file", file);
        return this.http.post(`/businesses/${id}/banner`, formData);
    }

    addGalleryImage(id: string, file: File): Promise<unknown> {
        const formData = new FormData();
        formData.append("file", file);
        return this.http.post(`/businesses/${id}/gallery`, formData);
    }

    deleteGalleryImage(businessId: string, imageId: string): Promise<unknown> {
        return this.http.delete(`/businesses/${businessId}/gallery/${imageId}`);
    }
}

export class HttpBusinessTeamRepository implements IBusinessTeamRepository {
    constructor(private readonly http: IHttpClient) {}

    async listByBusiness(businessId: string): Promise<TeamMemberLink[]> {
        const raw = await this.http.get<any>(`/business-professionals/business/${businessId}`);
        return BusinessMapper.toTeamList(raw);
    }

    linkProfessional(data: {
        businessId: string;
        email: string;
        active: boolean;
    }): Promise<unknown> {
        return this.http.post("/business-professionals", data);
    }

    unlinkProfessional(linkId: string): Promise<unknown> {
        return this.http.delete(`/business-professionals/${linkId}`);
    }

    updateLink(linkId: string, data: Record<string, unknown>): Promise<unknown> {
        return this.http.patch(`/business-professionals/${linkId}`, data);
    }

    async getAssignedServices(linkId: string): Promise<ServiceCatalogItem[]> {
        const raw = await this.http.get<any>(`/business-professionals/${linkId}/services`);
        return CatalogMapper.toDomainList(raw);
    }

    updateAssignedServices(linkId: string, serviceIds: string[]): Promise<unknown> {
        return this.http.patch(`/business-professionals/${linkId}/services`, { serviceIds });
    }

    async getShifts(linkId: string): Promise<ShiftInterval[]> {
        const raw = await this.http.get<any>(`/business-professionals/${linkId}/shifts`);
        const list = unwrapEnvelope<ShiftInterval[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    updateShifts(linkId: string, shifts: ShiftInterval[]): Promise<unknown> {
        return this.http.patch(`/business-professionals/${linkId}/shifts`, { shifts });
    }
}

export class HttpCatalogRepository implements ICatalogRepository {
    constructor(private readonly http: IHttpClient) {}

    private toPayload(item: Partial<ServiceCatalogItem>) {
        return {
            name: item.name,
            price: Number(item.price ?? 0),
            durationMinutes: Number(item.durationMinutes ?? 30),
            cleanupMinutes: Number(item.cleanupMinutes ?? 0),
        };
    }

    async listByBusiness(businessId: string): Promise<ServiceCatalogItem[]> {
        const raw = await this.http.get<any>(`/catalog/business/${businessId}`);
        return CatalogMapper.toDomainList(raw);
    }

    async create(
        businessId: string,
        item: Omit<ServiceCatalogItem, "id">,
    ): Promise<ServiceCatalogItem> {
        const raw = await this.http.post<any>(
            `/catalog/business/${businessId}`,
            this.toPayload(item),
        );
        return CatalogMapper.toDomain(unwrapEnvelope(raw));
    }

    async update(
        id: string,
        item: Partial<ServiceCatalogItem>,
    ): Promise<ServiceCatalogItem> {
        const raw = await this.http.patch<any>(`/catalog/${id}`, this.toPayload(item));
        return CatalogMapper.toDomain(unwrapEnvelope(raw));
    }

    async delete(id: string): Promise<void> {
        await this.http.delete(`/catalog/${id}`);
    }
}

export class HttpProfessionalRepository implements IProfessionalRepository {
    constructor(private readonly http: IHttpClient) {}

    async getPublicProfile(id: string): Promise<ProfessionalProfile> {
        const raw = await this.http.get<any>(`/professionals/${id}`);
        return unwrapEnvelope<ProfessionalProfile>(raw);
    }

    async getServices(id: string): Promise<any[]> {
        const raw = await this.http.get<any>(`/professionals/${id}/services`);
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    async getPortfolio(id: string): Promise<any[]> {
        const raw = await this.http.get<any>(`/professionals/${id}/portfolio`);
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    async getQualifications(id: string): Promise<Qualification[]> {
        const raw = await this.http.get<any>(`/professionals/${id}/qualifications`);
        const list = unwrapEnvelope<Qualification[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    updateProfile(data: {
        bio?: string;
        specialty?: string;
        visibilityStatus?: boolean;
    }): Promise<unknown> {
        return this.http.patch("/professionals/me/profile", data);
    }

    updateAvatar(file: File): Promise<unknown> {
        const fd = new FormData();
        fd.append("file", file);
        return this.http.post("/professionals/me/avatar", fd);
    }

    updateBanner(file: File): Promise<unknown> {
        const fd = new FormData();
        fd.append("file", file);
        return this.http.post("/professionals/me/banner", fd);
    }

    uploadPortfolioImage(file: File): Promise<unknown> {
        const fd = new FormData();
        fd.append("file", file);
        return this.http.post("/professionals/me/portfolio", fd);
    }

    deletePortfolioImage(id: string): Promise<unknown> {
        return this.http.delete(`/professionals/me/portfolio/${id}`);
    }

    addQualification(data: {
        file: File;
        title: string;
        institution?: string;
        approvement?: number;
        type?: string;
        year?: number;
    }): Promise<unknown> {
        const fd = new FormData();
        fd.append("file", data.file);
        fd.append("title", data.title);
        if (data.institution) fd.append("institution", data.institution);
        if (data.approvement !== undefined) fd.append("approvement", String(data.approvement));
        if (data.type) fd.append("type", data.type);
        if (data.year) fd.append("year", String(data.year));
        return this.http.post("/professionals/me/qualifications", fd);
    }

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
    ): Promise<unknown> {
        const fd = new FormData();
        if (data.file) fd.append("file", data.file);
        if (data.title) fd.append("title", data.title);
        if (data.institution !== undefined) fd.append("institution", data.institution);
        if (data.approvement !== undefined) fd.append("approvement", String(data.approvement));
        if (data.type) fd.append("type", data.type);
        if (data.year) fd.append("year", String(data.year));
        return this.http.patch(`/professionals/me/qualifications/${id}`, fd);
    }

    deleteQualification(id: string): Promise<unknown> {
        return this.http.delete(`/professionals/me/qualifications/${id}`);
    }
}

export class HttpSearchRepository implements ISearchRepository {
    constructor(private readonly http: IHttpClient) {}

    async searchProfessionals(
        query: string,
        filters?: {
            sortBy?: "default" | "trending" | "price_asc";
            minPrice?: number;
            maxPrice?: number;
            minRating?: number;
            limit?: number;
        },
    ): Promise<any[]> {
        const p = new URLSearchParams();
        if (query) p.set("q", query);
        if (filters?.sortBy && filters.sortBy !== "default") p.set("sortBy", filters.sortBy);
        if (filters?.minPrice !== undefined) p.set("minPrice", String(filters.minPrice));
        if (filters?.maxPrice !== undefined) p.set("maxPrice", String(filters.maxPrice));
        if (filters?.minRating !== undefined) p.set("minRating", String(filters.minRating));
        if (filters?.limit) p.set("limit", String(filters.limit));
        const raw = await this.http.get<any>(`/search/professionals?${p.toString()}`);
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    async searchBusinesses(query: string): Promise<any[]> {
        const raw = await this.http.get<any>(
            `/search/businesses?q=${encodeURIComponent(query)}`,
        );
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list : [];
    }

    async getRecommendedProfessionals(): Promise<any[]> {
        const raw = await this.http.get<any>("/search/professionals/recommended");
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list : [];
    }
}
