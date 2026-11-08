import type { AccountType } from "../../domain/entities/models";
import { Specifications } from "../../domain/specifications/Validators";
import type { IUserRepository } from "../../domain/ports";

export interface RegistrationDraft {
    accountType: AccountType;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    cpf: string;
    cep: string;
    street: string;
    addressNumber: string;
    complement: string;
    neighborhood: string;
    city: string;
    uf: string;
    birthDate: string;
    specialty: string;
    bio: string;
    cnpj: string;
    corporateName: string;
    tradeName: string;
    description: string;
    photoFile: File | null;
    acceptTerms: boolean;
}

export class RegistrationFormDataBuilder {
    private readonly fd = new FormData();

    withBaseUser(draft: RegistrationDraft): this {
        this.fd.append("accountType", draft.accountType);
        this.fd.append("nome", draft.name.trim());
        this.fd.append("email", draft.email.trim());
        this.fd.append("password", draft.password);
        this.fd.append("termosAceitos", String(draft.acceptTerms));
        if (draft.phone) this.fd.append("phone", draft.phone);
        if (draft.photoFile) this.fd.append("photo", draft.photoFile);
        return this;
    }

    withClientData(draft: RegistrationDraft): this {
        if (draft.cpf) this.fd.append("cpf", draft.cpf);
        if (draft.birthDate) this.fd.append("birthDate", draft.birthDate);
        if (draft.cep) this.fd.append("clientZipCode", draft.cep);
        if (draft.street) this.fd.append("clientStreet", draft.street);
        if (draft.addressNumber) this.fd.append("clientNumber", draft.addressNumber);
        if (draft.complement) this.fd.append("clientComplement", draft.complement);
        if (draft.neighborhood) this.fd.append("clientNeighborhood", draft.neighborhood);
        if (draft.city) this.fd.append("clientCity", draft.city);
        if (draft.uf) this.fd.append("clientState", draft.uf);
        return this;
    }

    withProfessionalData(draft: RegistrationDraft): this {
        if (draft.cpf) this.fd.append("cpf", draft.cpf);
        if (draft.specialty) this.fd.append("specialty", draft.specialty);
        if (draft.bio) this.fd.append("biography", draft.bio);
        return this;
    }

    withEstablishmentData(draft: RegistrationDraft): this {
        if (draft.cnpj) this.fd.append("cnpj", draft.cnpj);
        if (draft.corporateName) this.fd.append("legalName", draft.corporateName);
        if (draft.tradeName) this.fd.append("tradeName", draft.tradeName);
        if (draft.description) this.fd.append("description", draft.description);
        if (draft.cep) this.fd.append("zipCode", draft.cep);
        if (draft.street) this.fd.append("street", draft.street);
        if (draft.addressNumber) this.fd.append("addressNumber", draft.addressNumber);
        if (draft.complement) this.fd.append("complement", draft.complement);
        if (draft.neighborhood) this.fd.append("neighborhood", draft.neighborhood);
        if (draft.city) this.fd.append("city", draft.city);
        if (draft.uf) this.fd.append("state", draft.uf);
        return this;
    }

    build(): FormData {
        return this.fd;
    }
}

export interface AccountRegistrationStrategy {
    readonly accountType: AccountType;
    canAdvanceStep(step: number, draft: RegistrationDraft): boolean;
    buildFormData(draft: RegistrationDraft): FormData;
}

function isBaseCredentialsValid(draft: RegistrationDraft): boolean {
    return (
        Specifications.minLength(3).isSatisfiedBy(draft.name) &&
        Specifications.email.isSatisfiedBy(draft.email) &&
        Specifications.strongPassword.isSatisfiedBy(draft.password) &&
        draft.password === draft.confirmPassword &&
        Specifications.phone.isSatisfiedBy(draft.phone)
    );
}

function isOptionalOrCompleteAddressValid(draft: RegistrationDraft, required: boolean): boolean {
    const hasAny = Boolean(
        draft.cep ||
            draft.street ||
            draft.addressNumber ||
            draft.neighborhood ||
            draft.city ||
            draft.uf,
    );
    if (!required && !hasAny) return true;
    return (
        Specifications.cep.isSatisfiedBy(draft.cep) &&
        Specifications.minLength(3).isSatisfiedBy(draft.street) &&
        draft.addressNumber.trim().length > 0 &&
        Specifications.minLength(2).isSatisfiedBy(draft.neighborhood) &&
        Specifications.minLength(2).isSatisfiedBy(draft.city) &&
        draft.uf.trim().length === 2
    );
}

class ClientRegistrationStrategy implements AccountRegistrationStrategy {
    readonly accountType = "CLIENTE" as const;

    canAdvanceStep(step: number, draft: RegistrationDraft): boolean {
        if (step === 0) return true;
        if (step === 1) {
            return isBaseCredentialsValid(draft) && Specifications.cpf.isSatisfiedBy(draft.cpf);
        }
        if (step === 2) {
            return isOptionalOrCompleteAddressValid(draft, false);
        }
        if (step === 3) return draft.acceptTerms;
        return false;
    }

    buildFormData(draft: RegistrationDraft): FormData {
        return new RegistrationFormDataBuilder()
            .withBaseUser(draft)
            .withClientData(draft)
            .build();
    }
}

class ProfessionalRegistrationStrategy implements AccountRegistrationStrategy {
    readonly accountType = "PROFISSIONAL" as const;

    canAdvanceStep(step: number, draft: RegistrationDraft): boolean {
        if (step === 0) return true;
        if (step === 1) {
            return isBaseCredentialsValid(draft) && Specifications.cpf.isSatisfiedBy(draft.cpf);
        }
        if (step === 2) {
            return draft.specialty.trim().length > 0;
        }
        if (step === 3) return draft.acceptTerms;
        return false;
    }

    buildFormData(draft: RegistrationDraft): FormData {
        return new RegistrationFormDataBuilder()
            .withBaseUser(draft)
            .withProfessionalData(draft)
            .build();
    }
}

class EstablishmentRegistrationStrategy implements AccountRegistrationStrategy {
    readonly accountType = "ESTABELECIMENTO" as const;

    canAdvanceStep(step: number, draft: RegistrationDraft): boolean {
        if (step === 0) return true;
        if (step === 1) return isBaseCredentialsValid(draft);
        if (step === 2) {
            return (
                Specifications.cnpj.isSatisfiedBy(draft.cnpj) &&
                Specifications.minLength(2).isSatisfiedBy(draft.corporateName) &&
                Specifications.minLength(2).isSatisfiedBy(draft.tradeName) &&
                isOptionalOrCompleteAddressValid(draft, true)
            );
        }
        if (step === 3) return draft.acceptTerms;
        return false;
    }

    buildFormData(draft: RegistrationDraft): FormData {
        return new RegistrationFormDataBuilder()
            .withBaseUser(draft)
            .withEstablishmentData(draft)
            .build();
    }
}

const REGISTRATION_STRATEGIES: Record<AccountType, AccountRegistrationStrategy> = {
    CLIENTE: new ClientRegistrationStrategy(),
    PROFISSIONAL: new ProfessionalRegistrationStrategy(),
    ESTABELECIMENTO: new EstablishmentRegistrationStrategy(),
};

export class RegisterAccountUseCase {
    constructor(private readonly userRepo: IUserRepository) {}

    getStrategy(type: AccountType): AccountRegistrationStrategy {
        return REGISTRATION_STRATEGIES[type] ?? REGISTRATION_STRATEGIES.CLIENTE;
    }

    canAdvance(step: number, draft: RegistrationDraft): boolean {
        return this.getStrategy(draft.accountType).canAdvanceStep(step, draft);
    }

    async execute(draft: RegistrationDraft): Promise<unknown> {
        const strategy = this.getStrategy(draft.accountType);
        const formData = strategy.buildFormData(draft);
        return this.userRepo.register(formData);
    }
}
