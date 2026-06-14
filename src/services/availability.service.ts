import { http } from "./api";

export interface Bound {
    start: string;
    end: string;
    durationAvailable: number;
}

export interface BoundsParams {
    date: string;
    professionalId?: string;
    businessId: string;
    serviceId: string;
}

/**
 * Cache em memória dos horários disponíveis por combinação de
 * empresa/serviço/profissional/data. Permite exibir o resultado da última
 * consulta imediatamente ao navegar entre datas já visitadas
 * (RF16/AC3 - carregamento instantâneo), enquanto `refreshBounds` busca
 * a versão mais recente em segundo plano.
 */
const boundsCache = new Map<string, Bound[]>();

function boundsCacheKey(params: BoundsParams): string {
    return [params.businessId, params.serviceId, params.professionalId || "any", params.date].join("|");
}

function timeToMins(time: string): number {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
}

function minsToTime(mins: number): string {
    const hh = Math.floor(mins / 60).toString().padStart(2, "0");
    const mm = (mins % 60).toString().padStart(2, "0");
    return `${hh}:${mm}`;
}

export const availabilityService = {
    getBounds: (params: BoundsParams): Promise<Bound[]> => {
        const queryParams: Record<string, string> = { ...params } as Record<string, string>;
        if (!queryParams.professionalId) delete queryParams.professionalId;
        const query = new URLSearchParams(queryParams).toString();
        return http.get<Bound[]>(`/availability/bounds?${query}`);
    },

    /**
     * Retorna os horários em cache para a combinação informada, sem
     * disparar requisição (RF16/AC3).
     */
    getCachedBounds: (params: BoundsParams): Bound[] | undefined =>
        boundsCache.get(boundsCacheKey(params)),

    /**
     * Busca os horários disponíveis diretamente no backend e atualiza o
     * cache da combinação informada. Usado tanto para a carga inicial
     * quanto para atualizações periódicas dos horários bloqueados
     * (RF16/AC1) e para revalidar após um conflito de agendamento
     * (RF16/AC2).
     */
    refreshBounds: async (params: BoundsParams): Promise<Bound[]> => {
        const fresh = await availabilityService.getBounds(params);
        boundsCache.set(boundsCacheKey(params), fresh);
        return fresh;
    },

    /**
     * Converte os intervalos disponíveis (bounds) em uma lista de horários
     * de início selecionáveis, considerando a duração do serviço. Apenas
     * intervalos com tempo suficiente para o serviço completo são
     * considerados - os demais já vêm filtrados pelo backend (RF16/AC4).
     */
    generateAvailableSlots: (bounds: Bound[], durationMinutes: number, stepMinutes: number = durationMinutes): string[] => {
        const slots: string[] = [];
        for (const bound of bounds) {
            let current = timeToMins(bound.start);
            const end = timeToMins(bound.end);
            while (current + durationMinutes <= end) {
                const slot = minsToTime(current);
                if (!slots.includes(slot)) slots.push(slot);
                current += stepMinutes;
            }
        }
        return slots;
    },

    saveOperatingHour: (data: { businessId: string; dayOfWeek: number; startTime: string; endTime: string; isOpen: boolean }) =>
        http.post("/availability/operating-hours", data),

    saveShift: (data: { businessProfessionalId: string; dayOfWeek: number; startTime: string; endTime: string }) =>
        http.post("/availability/shifts", data),

    createException: (data: { businessId?: string; professionalId?: string; date?: string; dates?: string[]; startTime: string; endTime: string; reason: string; forceOverwritePending?: boolean; skipConflicts?: boolean }) =>
        http.post("/availability/exceptions", data),

    getExceptions: (params?: { professionalId?: string; businessId?: string }) => {
        const query = params ? new URLSearchParams(params as any).toString() : "";
        return http.get<any[]>(`/availability/exceptions${query ? `?${query}` : ''}`);
    },

    deleteException: (id: string) =>
        http.delete(`/availability/exceptions/${id}`),
};
