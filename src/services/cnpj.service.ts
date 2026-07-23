export interface CnpjResponse {
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

export async function fetchCnpjData(cnpj: string, apiBaseUrl: string): Promise<CnpjResponse | null> {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return null;
  try {
    const res = await fetch(`${apiBaseUrl}/lookup/cnpj/${digits}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
