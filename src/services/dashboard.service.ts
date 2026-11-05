import { http } from "./api";
import type { ApiEnvelope, DashboardQuery, DashboardResponse } from "../types/dashboard";

export const dashboardService = {
    // RF30 - GET /dashboard/businesses/:businessId?from&to (gestor do estabelecimento).
    getBusinessDashboard: async (query: DashboardQuery): Promise<DashboardResponse> => {
        const params = new URLSearchParams({ from: query.from, to: query.to });
        const res = await http.get<ApiEnvelope<DashboardResponse>>(
            `/dashboard/businesses/${query.businessId}?${params.toString()}`
        );
        return res.data;
    },

    // RF30/CA3 - Registra uma visualização da página pública do estabelecimento.
    // Fire-and-forget: o back é idempotente (1 view por usuário/dia) e ignora o próprio gestor,
    // então qualquer falha é silenciada para não afetar a tela.
    registerBusinessView: (businessId: string): void => {
        http.post<void>(`/businesses/${businessId}/views`, undefined).catch(() => {});
    },
};
