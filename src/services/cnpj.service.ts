import { container } from "../core/container";
import type { CnpjCompanyDto } from "../core/infrastructure/gateways/ExternalGateways";

export type CnpjResponse = CnpjCompanyDto;

export async function fetchCnpjData(
    cnpj: string,
    _apiBaseUrl?: string,
): Promise<CnpjResponse | null> {
    return container.cnpjLookupGateway.lookup(cnpj);
}
