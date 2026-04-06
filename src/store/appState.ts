import { createSignal, createEffect } from "solid-js";
import { translations, Language } from "./translations";

export const [accountRole, setAccountRole] = createSignal<"cliente" | "profissional">("cliente");
export const [idioma, setIdioma] = createSignal<Language>("PT");
export const [theme, setTheme] = createSignal<"light" | "dark">("light");

export const toggleRole = () => setAccountRole(prev => prev === "cliente" ? "profissional" : "cliente");
export const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");
export const isDark = () => theme() === "dark";

export const t = () => translations[idioma()];

createEffect(() => {
    document.documentElement.setAttribute("data-theme", theme());
});