export type ValidationErrorKey =
    | "invalidCpf"
    | "invalidCnpj"
    | "invalidPhone"
    | "invalidCep"
    | "invalidEmail"
    | "weakPassword"
    | "passwordMismatch"
    | "requiredField"
    | "minLength";

export interface ValidationSpecification {
    readonly errorKey: ValidationErrorKey;
    isSatisfiedBy(value: string): boolean;
}

export class CpfSpecification implements ValidationSpecification {
    readonly errorKey = "invalidCpf" as const;

    isSatisfiedBy(value: string): boolean {
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i), 10) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(digits.charAt(9), 10)) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i), 10) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        return rev === parseInt(digits.charAt(10), 10);
    }
}

export class CnpjSpecification implements ValidationSpecification {
    readonly errorKey = "invalidCnpj" as const;

    isSatisfiedBy(value: string): boolean {
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

        let size = digits.length - 2;
        let numbers = digits.substring(0, size);
        const checkDigits = digits.substring(size);
        let sum = 0;
        let pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i), 10) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(checkDigits.charAt(0), 10)) return false;

        size += 1;
        numbers = digits.substring(0, size);
        sum = 0;
        pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i), 10) * pos--;
            if (pos < 2) pos = 9;
        }
        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return result === parseInt(checkDigits.charAt(1), 10);
    }
}

export class PhoneSpecification implements ValidationSpecification {
    readonly errorKey = "invalidPhone" as const;

    isSatisfiedBy(value: string): boolean {
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 10 && digits.length !== 11) return false;
        return !/^(\d)\1+$/.test(digits);
    }
}

export class CepSpecification implements ValidationSpecification {
    readonly errorKey = "invalidCep" as const;

    isSatisfiedBy(value: string): boolean {
        const digits = value.replace(/\D/g, "");
        return digits.length === 8 && !/^(\d)\1+$/.test(digits);
    }
}

export class EmailSpecification implements ValidationSpecification {
    readonly errorKey = "invalidEmail" as const;

    isSatisfiedBy(value: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }
}

/**
 * Política de senhas alinhada ao OWASP ASVS v5.0.0 (6.2.1, 6.2.5, 6.2.8):
 * mínimo de 8 caracteres (15+ recomendado), sem regras de composição e no
 * máximo 72 bytes (limite do bcrypt). A lista de senhas comuns (6.2.4) é
 * aplicada no backend, que é a camada confiável.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

export class StrongPasswordSpecification implements ValidationSpecification {
    readonly errorKey = "weakPassword" as const;

    isSatisfiedBy(value: string): boolean {
        if (typeof value !== "string") return false;
        const length = Array.from(value).length;
        const bytes = new TextEncoder().encode(value).length;
        return length >= PASSWORD_MIN_LENGTH && bytes <= PASSWORD_MAX_BYTES;
    }
}

export class MinLengthSpecification implements ValidationSpecification {
    readonly errorKey = "minLength" as const;
    constructor(private readonly min: number) {}

    isSatisfiedBy(value: string): boolean {
        return value.trim().length >= this.min;
    }
}

export const Specifications = {
    cpf: new CpfSpecification(),
    cnpj: new CnpjSpecification(),
    phone: new PhoneSpecification(),
    cep: new CepSpecification(),
    email: new EmailSpecification(),
    strongPassword: new StrongPasswordSpecification(),
    minLength: (min: number) => new MinLengthSpecification(min),
};

export function createValidator(
    spec: ValidationSpecification,
    resolveMessage: (key: ValidationErrorKey) => string,
): (value: string) => string | null {
    return (value: string) => (spec.isSatisfiedBy(value) ? null : resolveMessage(spec.errorKey));
}

export function composeValidators(
    ...validators: Array<(value: string) => string | null>
): (value: string) => string | null {
    return (value: string) => {
        for (const validate of validators) {
            const error = validate(value);
            if (error) return error;
        }
        return null;
    };
}
