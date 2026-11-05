import { describe, expect, it } from "vitest";
import { ApiError } from "../../services/api";
import {
    extractErrorMessage,
    formatIsoDate,
    formatVariation,
    initialsOf,
    resolvePreset,
    validatePeriod,
    variationTrend,
} from "../dashboard-format";

describe("dashboard-format", () => {
    it("formatVariation trata null como 'sem base de comparação' (null ≠ 0) e sinaliza o crescimento", () => {
        expect(formatVariation(null)).toBe("sem base de comparação");
        expect(formatVariation(12.5)).toBe("+12,5%");
        expect(formatVariation(-3)).toBe("-3%");
        expect(formatVariation(0)).toBe("0%");
    });

    it("variationTrend distingue up/down/flat/none", () => {
        expect(variationTrend(null)).toBe("none");
        expect(variationTrend(1)).toBe("up");
        expect(variationTrend(-1)).toBe("down");
        expect(variationTrend(0)).toBe("flat");
    });

    it("formatIsoDate não sofre deslocamento de fuso", () => {
        expect(formatIsoDate("2026-10-01")).toBe("01/10/2026");
    });

    it("resolvePreset calcula os períodos a partir da data local", () => {
        const today = new Date(2026, 10, 5); // 05/11/2026
        expect(resolvePreset("currentMonth", today)).toEqual({ from: "2026-11-01", to: "2026-11-30" });
        expect(resolvePreset("previousMonth", today)).toEqual({ from: "2026-10-01", to: "2026-10-31" });
        expect(resolvePreset("last7", today)).toEqual({ from: "2026-10-30", to: "2026-11-05" });
        expect(resolvePreset("last30", today)).toEqual({ from: "2026-10-07", to: "2026-11-05" });
    });

    it("validatePeriod replica as regras do back", () => {
        expect(validatePeriod({ from: "2026-10-01", to: "2026-10-31" })).toBeNull();
        expect(validatePeriod({ from: "", to: "2026-10-31" })).toMatch(/data inicial/);
        expect(validatePeriod({ from: "2026-02-30", to: "2026-03-01" })).toMatch(/data inicial/);
        expect(validatePeriod({ from: "2026-10-01", to: "" })).toMatch(/data final/);
        expect(validatePeriod({ from: "2026-10-31", to: "2026-10-01" })).toMatch(/maior ou igual/);
        expect(validatePeriod({ from: "2025-01-01", to: "2026-01-01" })).toBeNull(); // 366 dias
        expect(validatePeriod({ from: "2025-01-01", to: "2026-01-02" })).toMatch(/366 dias/);
    });

    it("extractErrorMessage junta mensagens em array do Nest", () => {
        const err = new ApiError("x", 400, { message: ["a.", "b."] });
        expect(extractErrorMessage(err)).toBe("a. b.");
        expect(extractErrorMessage(new ApiError("Proibido", 403, { message: "Sem permissão." }))).toBe("Sem permissão.");
    });

    it("initialsOf gera as iniciais do nome", () => {
        expect(initialsOf("Ana Clara Matos")).toBe("AC");
        expect(initialsOf("  ")).toBe("?");
    });
});
