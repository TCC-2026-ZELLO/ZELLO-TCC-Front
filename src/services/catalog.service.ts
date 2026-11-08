import { container } from "../core/container";
import type { ServiceCatalogItem } from "../core/domain/entities/models";

export interface CatalogItemUI {
    id?: string;
    name: string;
    category?: string;
    price: number;
    durationMinutes: number;
    cleanupMinutes: number;
    active?: boolean;
}

export const catalogService = {
    list: (businessId: string): Promise<ServiceCatalogItem[]> =>
        container.catalogRepo.listByBusiness(businessId),

    create: (businessId: string, data: CatalogItemUI) =>
        container.catalogRepo.create(businessId, {
            ...data,
            active: data.active ?? true,
        }),

    update: (id: string, data: CatalogItemUI) => container.catalogRepo.update(id, data),

    toggleStatus: (_id: string, _active: boolean) => {},

    delete: (id: string) => container.catalogRepo.delete(id),
};