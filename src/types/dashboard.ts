// RF30 - Dashboards de faturamento do estabelecimento.
// Espelho de `zello-tcc-back/src/modules/dashboard/dto/dashboard-response.dto.ts`.
// Valores monetários em reais (2 casas); percentuais já multiplicados por 100.

export interface DashboardPeriod {
    from: string; // 'YYYY-MM-DD'
    to: string;
    previousFrom: string;
    previousTo: string;
}

export interface RevenueByService {
    serviceId: string;
    serviceName: string;
    revenue: number;
    appointmentsCount: number;
    sharePercent: number;
}

export interface RevenueTimelinePoint {
    date: string; // 'YYYY-MM-DD'
    revenue: number;
}

export interface RevenueSummary {
    total: number;
    previousTotal: number;
    variationPercent: number | null; // null = período anterior sem receita
    completedCount: number;
    averageTicket: number;
    byService: RevenueByService[];
    timeline: RevenueTimelinePoint[];
}

export interface TeamMemberPerformance {
    professionalId: string;
    name: string;
    appointmentsCount: number;
    revenue: number;
}

export interface VisibilityFunnel {
    views: number;
    appointments: number;
    conversionRate: number | null; // null se views = 0
}

export interface NoShowSummary {
    noShowCount: number;
    unjustifiedCancellationCount: number;
    lostRevenue: number;
    lostRevenuePercentOfPotential: number | null;
}

export interface DashboardResponse {
    period: DashboardPeriod;
    revenue: RevenueSummary;
    team: TeamMemberPerformance[];
    visibility: VisibilityFunnel;
    noShows: NoShowSummary;
}

export interface DashboardQuery {
    businessId: string;
    from: string;
    to: string;
}

export interface ApiEnvelope<T> {
    status: number;
    message: string;
    data: T;
}
