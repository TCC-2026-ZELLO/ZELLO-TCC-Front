import { createSignal } from "solid-js";
import { translations, Language } from "./translations";
import { isServer } from "solid-js/web";
import {User} from "~/services/auth.service";

export const API = "http://localhost:3001";

// -------------------------------------------------------------
export const [accountRole, setAccountRole] = createSignal<"cliente" | "profissional">("cliente");
export const [idioma, setIdioma] = createSignal<Language>("PT");
export const [theme, setTheme] = createSignal<"light" | "dark">("light");
export const [isSidebarCollapsed, setIsSidebarCollapsed] = createSignal(false);

export const [currentUser, setCurrentUser] = createSignal<User | null>(null);
export const [accessToken, setAccessToken] = createSignal<string | null>(null);

export const isAuthenticated = () => !!accessToken();
// -------------------------------------------------------------
if (!isServer) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        setTheme(savedTheme as "light" | "dark");
        document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
        document.documentElement.setAttribute("data-theme", "light");
    }

    const savedToken = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
        setAccessToken(savedToken);

        const parsedUser = JSON.parse(savedUser) as User;
        setCurrentUser(parsedUser);

        if (parsedUser.roles.includes("professional")) {
            setAccountRole("profissional");
        }
    }
}

// -------------------------------------------------------------

export const toggleRole = () => setAccountRole(prev => prev === "cliente" ? "profissional" : "cliente");

export const toggleTheme = () => {
    setTheme(prev => {
        const newTheme = prev === "light" ? "dark" : "light";
        if (!isServer) {
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        }
        return newTheme;
    });
};

export const isDark = () => theme() === "dark";
export const t = () => translations[idioma()];
export const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);