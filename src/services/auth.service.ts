import {accessToken, API, setAccessToken, setAccountRole, setCurrentUser} from "~/store/appState";
import { isServer } from "solid-js/web";
import { jwtDecode } from "jwt-decode";

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
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ZelloJwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
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
      method: 'POST', // Essencial para login
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // Mandando email e senha
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Email ou senha incorretos");
    }

    const data: LoginResponse = await response.json();

    // Lendo o JWT na hora para extrair as Roles atualizadas
    const decoded = jwtDecode<ZelloJwtPayload>(data.access_token);
    console.log("ID do Usuário logado:", decoded.sub);
    console.log("Roles do JWT:", decoded.roles);

    // Montando o usuário completo, garantindo que as roles venham do token
    const userWithRoles: User = {
      ...data.user,
      roles: decoded.roles || [],
    };

    // Chamando a função de salvar no estado passando os 3 parâmetros
    loginAuth(data.access_token, data.refresh_token, userWithRoles);

    return data; // Retorna os dados para a UI (ex: para fazer o redirect)

  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export function loginAuth(token: string, refresh_token: string, user: User) {
  setAccessToken(token);
  setCurrentUser(user);

  if (!isServer) {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", refresh_token); // Salvando o refresh!
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Define a vitrine automaticamente baseada na role do JWT
  if (user.roles.includes("professional")) {
    setAccountRole("profissional");
  } else {
    setAccountRole("cliente");
  }
}


// 2. Função assíncrona de Logout
export async function logout() {
  const token = accessToken() || (!isServer ? localStorage.getItem("access_token") : null);

  if (token) {
    try {
      // Avisa o backend para deletar o refresh_token do banco
      // Como a rota no NestJS tem @UseGuards(JwtAuthGuard), precisamos mandar o header de Authorization
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erro ao comunicar logout ao servidor:', error);
      // Nota: Mesmo se o servidor der erro (ex: token já expirado),
      // nós continuamos a execução para limpar os dados locais do usuário.
    }
  }

  // 3. Chama a função local para limpar o LocalStorage e os Signals
  logoutAuth();
}

// 4. Sua função de limpar o estado local (já estava certinha!)
export const logoutAuth = () => {
  setAccessToken(null);
  setCurrentUser(null);
  setAccountRole("cliente"); // Reseta para o padrão

  if (!isServer) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
  }
};