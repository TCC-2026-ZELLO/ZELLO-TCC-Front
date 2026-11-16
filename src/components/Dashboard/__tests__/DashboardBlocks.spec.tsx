import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { KpiCards } from "../KpiCards";
import { VisibilityFunnelCard } from "../VisibilityFunnelCard";
import { TeamPerformanceList } from "../TeamPerformanceList";
import { NoShowCard } from "../NoShowCard";
import type { DashboardPeriod, RevenueSummary } from "../../../types/dashboard";

const period: DashboardPeriod = {
    from: "2026-10-01",
    to: "2026-10-31",
    previousFrom: "2026-08-31",
    previousTo: "2026-09-30",
};

const revenue = (overrides: Partial<RevenueSummary> = {}): RevenueSummary => ({
    total: 1500,
    previousTotal: 1000,
    variationPercent: 50,
    completedCount: 10,
    averageTicket: 150,
    byService: [],
    timeline: [],
    ...overrides,
});

describe("Dashboard (RF30)", () => {
    it("KpiCards mostra crescimento quando a variação é positiva", () => {
        render(() => <KpiCards revenue={revenue()} period={period} />);
        expect(screen.getByText("+50%")).toBeInTheDocument();
        expect(screen.getByTestId("variation-badge")).toHaveTextContent("Crescimento");
    });

    it("KpiCards mostra 'sem base de comparação' quando variationPercent é null", () => {
        render(() => <KpiCards revenue={revenue({ previousTotal: 0, variationPercent: null })} period={period} />);
        expect(screen.getByTestId("variation-badge")).toHaveTextContent("sem base de comparação");
        expect(screen.queryByText("0%")).not.toBeInTheDocument();
    });

    it("VisibilityFunnelCard trata conversionRate null", () => {
        render(() => <VisibilityFunnelCard funnel={{ views: 0, appointments: 3, conversionRate: null }} />);
        expect(screen.getByText("sem visualizações no período")).toBeInTheDocument();
    });

    it("VisibilityFunnelCard exibe a taxa de conversão", () => {
        render(() => <VisibilityFunnelCard funnel={{ views: 200, appointments: 30, conversionRate: 15 }} />);
        expect(screen.getByText("15%")).toBeInTheDocument();
    });

    it("TeamPerformanceList lista profissionais sem atendimento", () => {
        render(() => (
            <TeamPerformanceList
                team={[
                    { professionalId: "1", name: "Ana Souza", appointmentsCount: 4, revenue: 400 },
                    { professionalId: "2", name: "Bruno Lima", appointmentsCount: 0, revenue: 0 },
                ]}
            />
        ));
        expect(screen.getByText("Bruno Lima")).toBeInTheDocument();
        expect(screen.getByText("Sem atendimentos")).toBeInTheDocument();
    });

    it("NoShowCard oculta o percentual do potencial quando é null", () => {
        render(() => (
            <NoShowCard
                noShows={{ noShowCount: 0, unjustifiedCancellationCount: 0, lostRevenue: 0, lostRevenuePercentOfPotential: null }}
            />
        ));
        expect(screen.queryByText(/do potencial/)).not.toBeInTheDocument();
    });
});
