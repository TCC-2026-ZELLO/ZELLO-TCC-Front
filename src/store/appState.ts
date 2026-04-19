import { createSignal } from "solid-js";
import { translations, Language } from "./translations";
import { isServer } from "solid-js/web";
import { User } from "~/services/auth.service";

// Usa a URL definida no arquivo .env (se existir), senão usa o localhost como padrão
export const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// -------------------------------------------------------------
export const [accountRole, setAccountRole] = createSignal<
  "cliente" | "profissional" | "estabelecimento"
>("cliente");
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

    // Define o papel inicial com base no cargo do usuário logado
    if (parsedUser.roles.includes("manager")) {
      setAccountRole("estabelecimento");
    } else if (parsedUser.roles.includes("professional")) {
      setAccountRole("profissional");
    }
  }
}

// -------------------------------------------------------------

export const toggleRole = () => {
  setAccountRole((prev) => {
    const user = currentUser();
    // Tipagem estrita recomendada no feedback
    const available: Array<"cliente" | "profissional" | "estabelecimento"> = [
      "cliente",
    ];

    if (user?.roles.includes("professional")) {
      available.push("profissional");
    }
    if (user?.roles.includes("manager")) {
      available.push("estabelecimento");
    }

    // Se tem 1 ou menos papéis disponíveis, força assumir o que estiver disponível
    if (available.length <= 1) {
      return available[0] || "cliente";
    }

    const currentIndex = available.indexOf(prev);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % available.length;
    return available[nextIndex];
  });
};

export const toggleTheme = () => {
  setTheme((prev) => {
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
