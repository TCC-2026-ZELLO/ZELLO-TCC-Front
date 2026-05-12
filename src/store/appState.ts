import { createSignal, batch } from "solid-js";
import { isServer } from "solid-js/web";
import { translations, Language } from "./translations";
import { BusinessContext, User } from "~/services/auth.service";

export type AccountType = "CLIENTE" | "PROFISSIONAL" | "ESTABELECIMENTO";

export const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const [isSidebarCollapsed, setIsSidebarCollapsed] = createSignal(false);
export const [idioma, setIdioma] = createSignal<Language>("PT");
export const [theme, setTheme] = createSignal<"light" | "dark">("light");
export const [isMounted, setIsMounted] = createSignal(false);

export const [currentUser, setCurrentUser] = createSignal<User | null>(null);
export const [accessToken, setAccessToken] = createSignal<string | null>(null);
export const [accountRole, setAccountRole] = createSignal<"cliente" | "profissional" | "estabelecimento">("cliente");

export const [managedBusinesses, setManagedBusinesses] = createSignal<BusinessContext[]>([]);
export const [activeBusiness, setActiveBusiness] = createSignal<BusinessContext | null>(null);

export const getUserId = () => currentUser()?.id;
export const getClientId = () => currentUser()?.client?.id || currentUser()?.id;
export const getProId = () => currentUser()?.professional?.id;
export const getManagerId = () => currentUser()?.manager?.id;
export const getActiveBizId = () => activeBusiness()?.businessId;


export function initializeStore() {
    if (isServer) return;

    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("access_token");
    const savedActiveBiz = localStorage.getItem("active_business");
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";

    batch(() => {
        if (savedUser && savedToken) {
            const parsed = JSON.parse(savedUser) as User;
            setCurrentUser(parsed);
            setAccessToken(savedToken);

            if (savedActiveBiz) setActiveBusiness(JSON.parse(savedActiveBiz));

            // Determine role based on parsed user roles
            if (parsed.roles.includes("manager")) setAccountRole("estabelecimento");
            else if (parsed.roles.includes("professional")) setAccountRole("profissional");
            else setAccountRole("cliente");
        }

        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
        }

        setIsMounted(true);
    });
}

export const toggleRole = () => {
    setAccountRole((prev) => {
        const user = currentUser();
        const available: Array<"cliente" | "profissional" | "estabelecimento"> = ["cliente"];

        if (user?.roles.includes("professional")) available.push("profissional");
        if (user?.roles.includes("manager")) available.push("estabelecimento");

        if (available.length <= 1) return available[0] || "cliente";

        const currentIndex = available.indexOf(prev);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % available.length;
        return available[nextIndex];
    });
};

export const toggleTheme = () => {
    setTheme((prev) => {
        const newTheme = prev === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        return newTheme;
    });
};

export const isDark = () => theme() === "dark";
export const t = () => translations[idioma()];
export const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
export const isAuthenticated = () => !!currentUser() && !!accessToken();