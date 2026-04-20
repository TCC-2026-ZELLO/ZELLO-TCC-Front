import {API, setAccessToken, setAccountRole, setCurrentUser} from "~/store/appState";
import { isServer } from "solid-js/web";

export type AccountType = "CLIENTE" | "PROFISSIONAL" | "ESTABELECIMENTO";

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

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  provider?: string;
}

// 1. Função de Registro Implementada
export async function register(payload: RegisterPayload) {
  try {
    const response = await fetch(`${API}/users`, { // Ajuste a rota se necessário
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao registrar usuário");
    }

    return await response.json();
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error; // Repassa o erro para o formulário exibir um alerta
  }
}

// 2. Função de Login Refatorada com Async/Await
export async function login(payload: LoginPayload) {
  try {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Email ou senha incorretos");
    }

    const data: LoginResponse = await response.json();

    // Montando o usuário completo assumindo que a API já retornou roles
    const userWithRoles: User = {
      ...data.user,
    };

    loginAuth(userWithRoles);

    return data;

  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
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

export function loginAuth(user: User) {
  setCurrentUser(user);
  
  // Set flag para persistir sessão logada
  setAccessToken("session-cookie-active");

  if (!isServer) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  setAccountRole(resolveAccountRole(user.roles));
}

// Logout
export async function logout() {
  try {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch (error) {
    console.error('Erro ao comunicar logout ao servidor:', error);
  }

  logoutAuth();
}

// 4. Função de limpar o estado local
export const logoutAuth = () => {
  setAccessToken(null);
  setCurrentUser(null);
  setAccountRole("cliente"); // Reseta para o padrão

  if (!isServer) {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};