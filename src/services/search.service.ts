import { http } from "./api";

export const searchService = {
    professionals: (query: string) =>
        http.get<any>(`/search/professionals?q=${query}`),

    businesses: (query: string) =>
        http.get<any>(`/search/businesses?q=${query}`),
};