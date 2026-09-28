import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot } from "solid-js";

vi.mock("../../services/serviceLocationService", () => ({
    serviceLocationService: {
        searchServicesByLocation: vi.fn(),
    },
}));

import { serviceLocationService } from "../../services/serviceLocationService";
import { useGeolocation } from "../useGeolocation";
import { emptyStateReason, nearbyServices, resetLocationSearch, userCoordinates } from "../../store/locationStore";

const mockedSearch = serviceLocationService.searchServicesByLocation as unknown as ReturnType<typeof vi.fn>;
const originalGeolocation = navigator.geolocation;

function mockGeolocationSuccess(latitude: number, longitude: number): void {
    Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
            getCurrentPosition: (success: PositionCallback) => {
                success({ coords: { latitude, longitude } } as GeolocationPosition);
            },
        },
    });
}

function mockGeolocationError(code: number): void {
    Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
            getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) => {
                error({ code } as GeolocationPositionError);
            },
        },
    });
}

describe("useGeolocation", () => {
    beforeEach(() => {
        resetLocationSearch();
        mockedSearch.mockReset();
    });

    afterEach(() => {
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: originalGeolocation });
    });

    it("obtém a posição do usuário e dispara a busca de estabelecimentos próximos no raio de 10km", async () => {
        mockGeolocationSuccess(-25.4284, -49.2733);
        mockedSearch.mockResolvedValue({
            status: 200,
            data: [{ id: "1", name: "Studio Bella" }],
            total: 1,
        });

        await createRoot(async (dispose) => {
            const { locateUser } = useGeolocation();
            await locateUser();
            dispose();
        });

        expect(mockedSearch).toHaveBeenCalledWith(-25.4284, -49.2733);
        expect(userCoordinates()).toEqual({ latitude: -25.4284, longitude: -49.2733 });
        expect(nearbyServices()).toHaveLength(1);
    });

    it("marca o motivo como 'no-permission' e não busca estabelecimentos quando o acesso é negado", async () => {
        mockGeolocationError(1); // PERMISSION_DENIED

        await createRoot(async (dispose) => {
            const { locateUser } = useGeolocation();
            await locateUser();
            dispose();
        });

        expect(mockedSearch).not.toHaveBeenCalled();
        expect(emptyStateReason()).toBe("no-permission");
    });
});
