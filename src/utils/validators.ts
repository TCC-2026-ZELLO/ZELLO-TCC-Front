import { Specifications } from "../core/domain/specifications/Validators";
import { t } from "../core/i18n";

export function validateCpf(value: string): string | null {
    return Specifications.cpf.isSatisfiedBy(value) ? null : t().validation.invalidCpf;
}

export function validateCnpj(value: string): string | null {
    return Specifications.cnpj.isSatisfiedBy(value) ? null : t().validation.invalidCnpj;
}

export function validatePhone(value: string): string | null {
    return Specifications.phone.isSatisfiedBy(value) ? null : t().validation.invalidPhone;
}

export function validateCep(value: string): string | null {
    return Specifications.cep.isSatisfiedBy(value) ? null : t().validation.invalidCep;
}
