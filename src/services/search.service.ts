import { http } from "./api";

export type SortBy = "default" | "trending" | "price_asc";

export interface SearchFilters {
    sortBy?: SortBy;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    limit?: number;
}

function buildParams(q: string, filters?: SearchFilters): string {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (filters?.sortBy && filters.sortBy !== "default") p.set("sortBy", filters.sortBy);
    if (filters?.minPrice !== undefined) p.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined) p.set("maxPrice", String(filters.maxPrice));
    if (filters?.minRating !== undefined) p.set("minRating", String(filters.minRating));
    if (filters?.limit)    p.set("limit",    String(filters.limit));
    return p.toString();
}

export const searchService = {
    professionals: (q: string, filters?: SearchFilters) =>
        http.get<any>(`/search/professionals?${buildParams(q, filters)}`),

    businesses: (q: string) =>
        http.get<any>(`/search/businesses?q=${encodeURIComponent(q)}`),

    recommended: () =>
        http.get<any>(`/search/professionals/recommended`),
};
