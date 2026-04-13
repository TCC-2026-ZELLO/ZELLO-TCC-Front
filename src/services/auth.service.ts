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