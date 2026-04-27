import { isServer } from "solid-js/web";
import { http } from "./api";

import {
  setCurrentUser,
  setAccessToken,
  setAccountRole,
  setManagedBusinesses,
  setActiveBusiness,
} from "~/store/appState";

export type AccountType = "CLIENTE" | "PROFISSIONAL" | "ESTABELECIMENTO";


export interface BusinessContext {
  linkId: string;
  businessId: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  client?: { id: string };
  professional?: { id: string };
  manager?: { id: string };
  provider?: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  termos_aceitos: boolean;
  papel: AccountType;
}
export interface RegisterResponse {
  id: string;
  nome: string;
  email: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
}

function resolveAccountRole(roles: string[]) {
  if (roles.includes("manager")) {
    return "estabelecimento";
  }

  if (roles.includes("professional")) {
    return "profissional";
  }

  if (roles.includes("client")) {
    return "cliente";
  }

  return "cliente";
}

export async function loadUserContext(user: User) {
  if (user.roles.includes("manager")) {
    try {
      const data = await http.get<any[]>('/businesses/me');
      const mapped = data.map((item) => ({
        linkId: item.id,
        businessId: item.business?.id || item.id,
        name: item.business?.tradeName || item.tradeName || "Empresa"
      }));
      setManagedBusinesses(mapped);
      if (mapped.length > 0) setActiveBusiness(mapped[0]);
    } catch (e) {
      console.error("Erro ao carregar contexto");
    }
  }
}

export async function login(payload: any) {
  const data = await http.post<{ user: User }>('/auth/login', payload);
  setCurrentUser(data.user);
  setAccessToken("session-cookie-active");
  if (!isServer) localStorage.setItem("user", JSON.stringify(data.user));

  const role = data.user.roles.includes("manager") ? "estabelecimento" :
      data.user.roles.includes("professional") ? "profissional" : "cliente";
  setAccountRole(role);
  await loadUserContext(data.user);
  return data;
}

export async function logout() {
  try { await http.post('/auth/logout', {}); } catch (e) {}
  if (!isServer) {
    localStorage.clear();
    window.location.href = "/login";
  }
}

export function loginAuth(user: User) {
  setCurrentUser(user);

  setAccessToken("session-cookie-active");

  if (!isServer) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  setAccountRole(resolveAccountRole(user.roles));
}

export const logoutAuth = () => {
  setAccessToken(null);
  setCurrentUser(null);
  setAccountRole("cliente");

  if (!isServer) {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};