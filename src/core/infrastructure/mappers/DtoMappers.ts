import type {
    Appointment,
    BusinessContext,
    BusinessProfileData,
    ClientReputation,
    ServiceCatalogItem,
    TeamMemberLink,
    User,
} from "../../domain/entities/models";

export function unwrapEnvelope<T>(payload: any): T {
    if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
        return payload.data as T;
    }
    return payload as T;
}

export const UserMapper = {
    toDomain(raw: any): User {
        const u = unwrapEnvelope<any>(raw);
        return {
            id: String(u?.id ?? ""),
            name: String(u?.name ?? u?.nome ?? ""),
            email: String(u?.email ?? ""),
            roles: Array.isArray(u?.roles) ? u.roles : [],
            client: u?.client,
            professional: u?.professional,
            manager: u?.manager,
            provider: u?.provider,
            wantsEmailReminders: u?.wantsEmailReminders ?? true,
            wantsWhatsappReminders: u?.wantsWhatsappReminders ?? true,
        };
    },

    toBusinessContexts(rawList: any): BusinessContext[] {
        const items = unwrapEnvelope<any[]>(rawList);
        if (!Array.isArray(items)) return [];
        return items.map((item) => ({
            linkId: String(item?.id ?? ""),
            businessId: String(item?.business?.id || item?.id || ""),
            name: String(item?.business?.tradeName || item?.tradeName || item?.name || "Estabelecimento"),
        }));
    },
};

export const AppointmentMapper = {
    toDomain(raw: any): Appointment {
        return {
            id: String(raw?.id ?? ""),
            date: String(raw?.date ?? ""),
            startTime: String(raw?.startTime ?? ""),
            endTime: String(raw?.endTime ?? ""),
            status: raw?.status ?? "PENDING",
            rescheduleCount: Number(raw?.rescheduleCount ?? 0),
            proposedDate: raw?.proposedDate ?? null,
            proposedStartTime: raw?.proposedStartTime ?? null,
            cancelledByRole: raw?.cancelledByRole ?? null,
            professionalId: raw?.professionalId ?? raw?.professional?.id,
            businessId: raw?.businessId ?? raw?.business?.id,
            serviceId: raw?.serviceId ?? raw?.service?.id,
            client: raw?.client,
            professional: raw?.professional,
            business: raw?.business,
            service: raw?.service,
        };
    },

    toDomainList(raw: any): Appointment[] {
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list.map(AppointmentMapper.toDomain) : [];
    },

    toReputation(raw: any): ClientReputation {
        const r = unwrapEnvelope<any>(raw);
        return {
            noShowCount: Number(r?.noShowCount ?? 0),
            successStreak: Number(r?.successStreak ?? 0),
        };
    },
};

export const CatalogMapper = {
    toDomain(raw: any): ServiceCatalogItem {
        const svc = raw?.service ?? raw;
        return {
            id: String(svc?.id ?? raw?.id ?? ""),
            name: String(svc?.name ?? ""),
            description: svc?.description,
            category: svc?.category ?? raw?.category ?? "Cabelo",
            price: Number(svc?.price ?? 0),
            durationMinutes: Number(svc?.durationMinutes ?? svc?.duration ?? 30),
            cleanupMinutes: Number(svc?.cleanupMinutes ?? 0),
            active: svc?.active !== false,
        };
    },

    toDomainList(raw: any): ServiceCatalogItem[] {
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list.map(CatalogMapper.toDomain) : [];
    },
};

export const BusinessMapper = {
    toDomain(raw: any): BusinessProfileData {
        const b = unwrapEnvelope<any>(raw);
        return {
            ...b,
            id: String(b?.id ?? ""),
            tradeName: String(b?.tradeName ?? b?.name ?? ""),
            name: b?.name ?? b?.tradeName,
        };
    },

    toTeamList(raw: any): TeamMemberLink[] {
        const list = unwrapEnvelope<any[]>(raw);
        return Array.isArray(list) ? list : [];
    },
};
