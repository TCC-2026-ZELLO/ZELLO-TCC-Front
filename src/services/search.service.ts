import { container } from "../core/container";

export type SortBy = "default" | "trending" | "price_asc";

export interface SearchFilters {
    sortBy?: SortBy;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    limit?: number;
}

export const searchService = {
    professionals: (q: string, filters?: SearchFilters) =>
        container.searchRepo.searchProfessionals(q, filters),

    businesses: (q: string) => container.searchRepo.searchBusinesses(q),

    recommended: () => container.searchRepo.getRecommendedProfessionals(),
};
