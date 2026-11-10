import { container } from "../core/container";
import type { ViaCepAddressDto } from "../core/infrastructure/gateways/ExternalGateways";

export type ViaCepResponse = ViaCepAddressDto;

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
    return container.viaCepGateway.lookup(cep);
}
