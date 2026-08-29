import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { ServicePin } from "../ServicePin";
import type { ServiceLocation } from "../../../types/location";

const service: ServiceLocation = {
    id: "biz-1",
    name: "Studio Bella",
    latitude: -25.4284,
    longitude: -49.2733,
    rating: 4.5,
    category: "Cabelo",
    services: "Corte, Escova, Coloração",
    distanceKm: 2.345,
};

describe("ServicePin", () => {
    it("exibe os dados do estabelecimento e chama onSelect com o item ao clicar", () => {
        const onSelect = vi.fn();
        render(() => <ServicePin service={service} isActive={false} onSelect={onSelect} />);

        expect(screen.getByText("Studio Bella")).toBeInTheDocument();
        expect(screen.getByText("2.3 km")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button"));
        expect(onSelect).toHaveBeenCalledWith(service);
    });

    it("reflete o estado ativo via aria-pressed", () => {
        render(() => <ServicePin service={service} isActive={true} onSelect={vi.fn()} />);
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });
});
