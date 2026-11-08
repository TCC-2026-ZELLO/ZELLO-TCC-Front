import { A, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";
import {
    BriefcaseIcon,
    BuildingIcon,
    StarIcon,
    UserIcon,
    ZelloIcon,
} from "../components/Icons/Icons";
import { Button } from "../components/Widgets/Button";
import { Input } from "../components/Widgets/Input";
import { LanguageSwitcher } from "../components/Widgets/LanguageSwitcher";
import { MaskedInput } from "../components/Widgets/MaskedInput";
import { PhotoUpload } from "../components/Widgets/PhotoUpload";
import { ThemeSwitcher } from "../components/Widgets/ThemeSwitcher";
import type { RegistrationDraft } from "../core/application/registration/RegistrationStrategies";
import { container } from "../core/container";
import { Specifications } from "../core/domain/specifications/Validators";
import {
    formatDecimal,
    formatInteger,
    localizeDomain,
    t,
} from "../core/i18n";
import type { AccountType } from "../services/auth.service";
import { fetchCnpjData } from "../services/cnpj.service";
import { fetchAddressByCep } from "../services/viacep.service";
import {
    validateCep,
    validateCnpj,
    validateCpf,
    validatePhone,
} from "../utils/validators";

const SPECIALTY_VALUES = [
    "Cabeleireiro(a)",
    "Barbeiro(a)",
    "Manicure/Pedicure",
    "Esteticista",
    "Maquiador(a)",
    "Designer de Sobrancelhas",
    "Depilador(a)",
    "Massagista",
    "Outro",
] as const;

export default function Register() {
    const navigate = useNavigate();

    const [step, setStep] = createSignal(0);
    const [accountType, setAccountType] = createSignal<AccountType>("CLIENTE");

    const [name, setName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [phone, setPhone] = createSignal("");
    const [cpf, setCpf] = createSignal("");
    const [birthDate, setBirthDate] = createSignal("");
    const [photoFile, setPhotoFile] = createSignal<File | null>(null);

    const [specialty, setSpecialty] = createSignal("");
    const [bio, setBio] = createSignal("");

    const [cnpj, setCnpj] = createSignal("");
    const [corporateName, setCorporateName] = createSignal("");
    const [tradeName, setTradeName] = createSignal("");
    const [description, setDescription] = createSignal("");

    const [cep, setCep] = createSignal("");
    const [street, setStreet] = createSignal("");
    const [addressNumber, setAddressNumber] = createSignal("");
    const [complement, setComplement] = createSignal("");
    const [neighborhood, setNeighborhood] = createSignal("");
    const [city, setCity] = createSignal("");
    const [uf, setUf] = createSignal("");
    const [acceptTerms, setAcceptTerms] = createSignal(false);

    const [cepLoading, setCepLoading] = createSignal(false);
    const [cnpjLoading, setCnpjLoading] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [errorMessage, setErrorMessage] = createSignal("");
    const [success, setSuccess] = createSignal(false);

    const buildDraft = (): RegistrationDraft => ({
        accountType: accountType(),
        name: name(),
        email: email(),
        password: password(),
        confirmPassword: confirmPassword(),
        phone: phone(),
        cpf: cpf(),
        cep: cep(),
        street: street(),
        addressNumber: addressNumber(),
        complement: complement(),
        neighborhood: neighborhood(),
        city: city(),
        uf: uf(),
        birthDate: birthDate(),
        specialty: specialty(),
        bio: bio(),
        cnpj: cnpj(),
        corporateName: corporateName(),
        tradeName: tradeName(),
        description: description(),
        photoFile: photoFile(),
        acceptTerms: acceptTerms(),
    });

    const stepLabels = () => {
        const s = t().auth.register.steps;
        const third =
            accountType() === "CLIENTE"
                ? s.clientDetails
                : accountType() === "PROFISSIONAL"
                  ? s.proDetails
                  : s.bizDetails;
        return [s.profile, s.credentials, third, s.finish];
    };

    createEffect(() => {
        const cepVal = cep();
        if (cepVal.replace(/\D/g, "").length === 8) {
            setCepLoading(true);
            fetchAddressByCep(cepVal)
                .then((data) => {
                    if (data) {
                        setStreet(data.logradouro || "");
                        setNeighborhood(data.bairro || "");
                        setCity(data.localidade || "");
                        setUf(data.uf || "");
                    }
                })
                .finally(() => setCepLoading(false));
        }
    });

    createEffect(() => {
        const cnpjVal = cnpj();
        if (cnpjVal.replace(/\D/g, "").length === 14) {
            setCnpjLoading(true);
            fetchCnpjData(cnpjVal)
                .then((data) => {
                    if (data) {
                        if (data.nome) setCorporateName(data.nome);
                        if (data.fantasia) setTradeName(data.fantasia);
                        else if (data.nome && !tradeName()) setTradeName(data.nome);
                    }
                })
                .finally(() => setCnpjLoading(false));
        }
    });

    const handleAccountTypeChange = (type: AccountType) => {
        setAccountType(type);
        setErrorMessage("");
    };

    const canAdvance = () =>
        container.registerAccountUseCase.canAdvance(step(), buildDraft());

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setErrorMessage("");

        if (step() < 3) {
            if (canAdvance()) setStep(step() + 1);
            return;
        }

        if (!canAdvance()) return;

        setLoading(true);
        try {
            await container.registerAccountUseCase.execute(buildDraft());
            setSuccess(true);
            setTimeout(() => navigate("/login"), 1800);
        } catch (error: any) {
            setErrorMessage(
                localizeDomain.apiError(
                    error?.message,
                    t().common.genericError,
                ),
            );
        } finally {
            setLoading(false);
        }
    };

    const accountOptions = () =>
        (
            [
                { type: "CLIENTE" as AccountType, Icon: UserIcon },
                { type: "PROFISSIONAL" as AccountType, Icon: BriefcaseIcon },
                { type: "ESTABELECIMENTO" as AccountType, Icon: BuildingIcon },
            ] as const
        ).map((item) => ({
            ...item,
            label: t().auth.register.accountTypes[item.type].label,
            desc: t().auth.register.accountTypes[item.type].desc,
        }));

    return (
        <main class="min-h-dvh bg-background text-foreground">
            <div class="flex min-h-dvh flex-col lg:flex-row">
                {/* LADO ESQUERDO: BANNER */}
                <div class="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-border/20 bg-sidebar p-8 lg:flex">
                    <div class="z-10 flex max-w-md flex-col items-center text-center">
                        <A
                            href="/"
                            class="mb-6 flex size-16 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground transition-transform hover:scale-105"
                        >
                            <ZelloIcon />
                        </A>
                        <span class="mb-3 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">
                            {t().auth.register.bannerBadge}
                        </span>
                        <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
                            {t().auth.register.bannerTitle}
                        </h1>
                        <p class="mb-10 text-base leading-relaxed text-sidebar-foreground/80">
                            {t().auth.register.bannerDesc}
                        </p>

                        <div class="grid w-full grid-cols-3 gap-3">
                            <div class="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div class="text-xl font-bold text-sidebar-foreground">
                                    {formatInteger(2400)}+
                                </div>
                                <div class="mt-1 text-xs text-sidebar-foreground/75">
                                    {t().auth.stats.establishmentsLabel}
                                </div>
                            </div>
                            <div class="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div class="text-xl font-bold text-sidebar-foreground">
                                    {formatInteger(18000)}+
                                </div>
                                <div class="mt-1 text-xs text-sidebar-foreground/75">
                                    {t().auth.stats.appointmentsLabel}
                                </div>
                            </div>
                            <div class="rounded-xl border border-white/15 bg-white/5 p-4">
                                <div class="flex items-center justify-center gap-1 text-xl font-bold text-sidebar-foreground">
                                    {formatDecimal(4.9)}
                                    <StarIcon class="size-4 text-warning" />
                                </div>
                                <div class="mt-1 text-xs text-sidebar-foreground/75">
                                    {t().auth.stats.ratingLabel}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO: FORMULÁRIO */}
                <div class="flex flex-1 flex-col overflow-y-auto bg-background px-4 py-6 sm:px-8">
                    <div class="flex items-center justify-between">
                        <A
                            href="/"
                            class="flex items-center gap-2 font-bold text-foreground lg:invisible"
                        >
                            <div class="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <ZelloIcon />
                            </div>
                            <span>{t().sidebar.brand}</span>
                        </A>
                        <div class="flex items-center gap-2">
                            <LanguageSwitcher compact />
                            <ThemeSwitcher />
                        </div>
                    </div>

                    <div class="my-auto flex w-full justify-center py-6">
                        <div class="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-md sm:p-8">
                            <div class="flex items-center justify-between border-b border-border pb-4">
                                <For each={stepLabels()}>
                                    {(label, idx) => (
                                        <>
                                            <div class="flex items-center gap-2">
                                                <div
                                                    class={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                        step() > idx()
                                                            ? "bg-success text-primary-foreground"
                                                            : step() === idx()
                                                              ? "bg-primary text-primary-foreground"
                                                              : "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {step() > idx() ? "✓" : idx() + 1}
                                                </div>
                                                <span
                                                    class={`text-xs font-semibold sm:text-sm ${
                                                        step() === idx()
                                                            ? "block text-foreground"
                                                            : "hidden md:block text-muted-foreground"
                                                    }`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                            <Show when={idx() < stepLabels().length - 1}>
                                                <div class="mx-2 flex-1 border-t border-border" />
                                            </Show>
                                        </>
                                    )}
                                </For>
                            </div>

                            <Show when={success()}>
                                <div
                                    role="status"
                                    class="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
                                >
                                    ✓ {t().auth.register.successMessage}
                                </div>
                            </Show>

                            <Show when={errorMessage()}>
                                <div
                                    role="alert"
                                    class="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error"
                                >
                                    {errorMessage()}
                                </div>
                            </Show>

                            <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                                <Show when={step() === 0}>
                                    <div>
                                        <h1 class="mb-1 text-2xl font-bold text-foreground">
                                            {t().auth.register.title}
                                        </h1>
                                        <p class="text-sm text-muted-foreground">
                                            {t().auth.register.subtitle}
                                        </p>
                                    </div>

                                    <div class="flex flex-col gap-3">
                                        <For each={accountOptions()}>
                                            {(opt) => (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAccountTypeChange(opt.type)
                                                    }
                                                    class={`flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                                                        accountType() === opt.type
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/40 hover:bg-secondary/30"
                                                    }`}
                                                >
                                                    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                                                        <opt.Icon class="size-5" />
                                                    </div>
                                                    <div class="min-w-0 flex-1">
                                                        <p class="font-bold text-foreground">
                                                            {opt.label}
                                                        </p>
                                                        <p class="text-xs text-muted-foreground sm:text-sm">
                                                            {opt.desc}
                                                        </p>
                                                    </div>
                                                </button>
                                            )}
                                        </For>
                                    </div>
                                </Show>

                                <Show when={step() === 1}>
                                    <div class="mb-1 flex flex-col items-center gap-2">
                                        <span class="text-xs font-semibold text-muted-foreground">
                                            {t().auth.register.fields.photoLabel}
                                        </span>
                                        <PhotoUpload
                                            file={photoFile()}
                                            onFileChange={setPhotoFile}
                                            disabled={loading()}
                                        />
                                    </div>

                                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Input
                                            labelText={t().auth.register.fields.fullName}
                                            value={name()}
                                            onInput={(e) =>
                                                setName(e.currentTarget.value)
                                            }
                                            validate={(v) =>
                                                Specifications.minLength(
                                                    3,
                                                ).isSatisfiedBy(v)
                                                    ? null
                                                    : t().validation.minLength
                                            }
                                            disabled={loading()}
                                            required
                                        />
                                        <Input
                                            labelText={t().auth.register.fields.email}
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email()}
                                            onInput={(e) =>
                                                setEmail(e.currentTarget.value)
                                            }
                                            validate={(v) =>
                                                Specifications.email.isSatisfiedBy(v)
                                                    ? null
                                                    : t().validation.invalidEmail
                                            }
                                            disabled={loading()}
                                            required
                                        />
                                    </div>

                                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <MaskedInput
                                            mask="phone"
                                            labelText={t().auth.register.fields.phone}
                                            placeholder="(00) 00000-0000"
                                            value={phone()}
                                            onInput={setPhone}
                                            error={
                                                phone() ? validatePhone(phone()) : null
                                            }
                                            disabled={loading()}
                                            required
                                        />
                                        <Show
                                            when={accountType() !== "ESTABELECIMENTO"}
                                            fallback={
                                                <Input
                                                    labelText={
                                                        t().auth.register.fields
                                                            .birthDate
                                                    }
                                                    type="date"
                                                    value={birthDate()}
                                                    onInput={(e) =>
                                                        setBirthDate(
                                                            e.currentTarget.value,
                                                        )
                                                    }
                                                    disabled={loading()}
                                                />
                                            }
                                        >
                                            <MaskedInput
                                                mask="cpf"
                                                labelText={t().auth.register.fields.cpf}
                                                placeholder="000.000.000-00"
                                                value={cpf()}
                                                onInput={setCpf}
                                                error={cpf() ? validateCpf(cpf()) : null}
                                                disabled={loading()}
                                                required
                                            />
                                        </Show>
                                    </div>

                                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Input
                                            labelText={t().auth.register.fields.password}
                                            type="password"
                                            value={password()}
                                            onInput={(e) =>
                                                setPassword(e.currentTarget.value)
                                            }
                                            validate={(v) =>
                                                Specifications.strongPassword.isSatisfiedBy(
                                                    v,
                                                )
                                                    ? null
                                                    : t().validation.weakPassword
                                            }
                                            disabled={loading()}
                                            required
                                        />
                                        <Input
                                            labelText={
                                                t().auth.register.fields.confirmPassword
                                            }
                                            type="password"
                                            value={confirmPassword()}
                                            onInput={(e) =>
                                                setConfirmPassword(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            error={
                                                confirmPassword() &&
                                                password() !== confirmPassword()
                                                    ? t().validation.passwordMismatch
                                                    : undefined
                                            }
                                            disabled={loading()}
                                            required
                                        />
                                    </div>
                                </Show>

                                <Show
                                    when={
                                        step() === 2 && accountType() === "PROFISSIONAL"
                                    }
                                >
                                    <div class="flex flex-col gap-1.5">
                                        <label class="text-sm font-semibold text-foreground">
                                            {t().auth.register.fields.specialty} *
                                        </label>
                                        <select
                                            class="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                                            value={specialty()}
                                            onChange={(e) =>
                                                setSpecialty(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                            required
                                        >
                                            <option value="" disabled>
                                                {
                                                    t().auth.register.fields
                                                        .specialtyPlaceholder
                                                }
                                            </option>
                                            <For each={SPECIALTY_VALUES}>
                                                {(spec) => (
                                                    <option value={spec}>
                                                        {localizeDomain.specialty(spec)}
                                                    </option>
                                                )}
                                            </For>
                                        </select>
                                    </div>

                                    <div class="flex flex-col gap-1.5">
                                        <label class="text-sm font-semibold text-foreground">
                                            {t().auth.register.fields.bio}
                                        </label>
                                        <textarea
                                            rows="4"
                                            class="w-full rounded-lg border border-input bg-card p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                                            placeholder={
                                                t().auth.register.fields.bioPlaceholder
                                            }
                                            value={bio()}
                                            onInput={(e) =>
                                                setBio(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                        />
                                    </div>
                                </Show>

                                <Show
                                    when={
                                        step() === 2 &&
                                        (accountType() === "CLIENTE" ||
                                            accountType() === "ESTABELECIMENTO")
                                    }
                                >
                                    <Show when={accountType() === "CLIENTE"}>
                                        <p class="text-xs text-muted-foreground">
                                            {
                                                t().auth.register.fields
                                                    .optionalAddressHint
                                            }
                                        </p>
                                    </Show>

                                    <Show when={accountType() === "ESTABELECIMENTO"}>
                                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <MaskedInput
                                                mask="cnpj"
                                                labelText={t().auth.register.fields.cnpj}
                                                placeholder="00.000.000/0000-00"
                                                value={cnpj()}
                                                onInput={setCnpj}
                                                error={
                                                    cnpj() ? validateCnpj(cnpj()) : null
                                                }
                                                disabled={loading() || cnpjLoading()}
                                                required
                                            />
                                            <Input
                                                labelText={
                                                    t().auth.register.fields.tradeName
                                                }
                                                value={tradeName()}
                                                onInput={(e) =>
                                                    setTradeName(e.currentTarget.value)
                                                }
                                                disabled={loading()}
                                                required
                                            />
                                        </div>
                                        <Input
                                            labelText={
                                                t().auth.register.fields.corporateName
                                            }
                                            value={corporateName()}
                                            onInput={(e) =>
                                                setCorporateName(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                            required
                                        />
                                        <Show when={cnpjLoading()}>
                                            <p class="text-xs text-primary">
                                                {t().auth.register.fields.searchingCnpj}
                                            </p>
                                        </Show>
                                    </Show>

                                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <MaskedInput
                                            mask="cep"
                                            labelText={t().auth.register.fields.cep}
                                            placeholder="00000-000"
                                            value={cep()}
                                            onInput={setCep}
                                            error={cep() ? validateCep(cep()) : null}
                                            disabled={loading() || cepLoading()}
                                            required={
                                                accountType() === "ESTABELECIMENTO"
                                            }
                                        />
                                        <Input
                                            labelText={t().auth.register.fields.street}
                                            value={street()}
                                            onInput={(e) =>
                                                setStreet(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                            required={
                                                accountType() === "ESTABELECIMENTO"
                                            }
                                        />
                                    </div>
                                    <Show when={cepLoading()}>
                                        <p class="text-xs text-primary">
                                            {t().auth.register.fields.searchingCep}
                                        </p>
                                    </Show>

                                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Input
                                            labelText={t().auth.register.fields.number}
                                            value={addressNumber()}
                                            onInput={(e) =>
                                                setAddressNumber(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                            required={
                                                accountType() === "ESTABELECIMENTO"
                                            }
                                        />
                                        <Input
                                            labelText={
                                                t().auth.register.fields.complement
                                            }
                                            value={complement()}
                                            onInput={(e) =>
                                                setComplement(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                        />
                                    </div>

                                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <Input
                                            labelText={
                                                t().auth.register.fields.neighborhood
                                            }
                                            value={neighborhood()}
                                            onInput={(e) =>
                                                setNeighborhood(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                            required={
                                                accountType() === "ESTABELECIMENTO"
                                            }
                                        />
                                        <Input
                                            labelText={t().auth.register.fields.city}
                                            value={city()}
                                            onInput={(e) =>
                                                setCity(e.currentTarget.value)
                                            }
                                            disabled={loading()}
                                            required={
                                                accountType() === "ESTABELECIMENTO"
                                            }
                                        />
                                        <Input
                                            labelText={t().auth.register.fields.uf}
                                            maxLength={2}
                                            value={uf()}
                                            onInput={(e) =>
                                                setUf(
                                                    e.currentTarget.value.toUpperCase(),
                                                )
                                            }
                                            disabled={loading()}
                                            required={
                                                accountType() === "ESTABELECIMENTO"
                                            }
                                        />
                                    </div>
                                </Show>

                                <Show when={step() === 3}>
                                    <div class="flex flex-col gap-4 rounded-xl border border-border bg-secondary/20 p-4">
                                        <h2 class="text-lg font-bold text-foreground">
                                            {t().auth.register.reviewTitle}
                                        </h2>
                                        <div class="flex flex-col gap-1 text-sm text-muted-foreground">
                                            <p>
                                                {t().auth.register.selectedAccount}{" "}
                                                <strong class="text-foreground">
                                                    {
                                                        t().auth.register.accountTypes[
                                                            accountType()
                                                        ].label
                                                    }
                                                </strong>
                                            </p>
                                            <p>
                                                <strong class="text-foreground">
                                                    {name()}
                                                </strong>{" "}
                                                · {email()}
                                            </p>
                                        </div>

                                        <label class="mt-2 flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
                                            <input
                                                type="checkbox"
                                                checked={acceptTerms()}
                                                onChange={(e) =>
                                                    setAcceptTerms(
                                                        e.currentTarget.checked,
                                                    )
                                                }
                                                class="mt-0.5 size-4 accent-primary"
                                            />
                                            <span>
                                                {t().auth.register.termsPrefix}{" "}
                                                <span class="font-semibold text-primary">
                                                    {t().auth.register.termsLink}
                                                </span>{" "}
                                                {t().auth.register.and}{" "}
                                                <span class="font-semibold text-primary">
                                                    {t().auth.register.privacyLink}
                                                </span>
                                                .
                                            </span>
                                        </label>
                                    </div>
                                </Show>

                                <div class="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                                    <Show
                                        when={step() > 0}
                                        fallback={
                                            <div class="text-center text-sm text-muted-foreground sm:self-center">
                                                {t().auth.register.alreadyHaveAccount}{" "}
                                                <A
                                                    href="/login"
                                                    class="font-bold text-primary hover:underline"
                                                >
                                                    {t().auth.register.signIn}
                                                </A>
                                            </div>
                                        }
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(step() - 1)}
                                            disabled={loading()}
                                        >
                                            ← {t().auth.register.prevStep}
                                        </Button>
                                    </Show>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={loading() || !canAdvance()}
                                    >
                                        {step() < 3
                                            ? `${t().auth.register.nextStep} →`
                                            : loading()
                                              ? t().auth.register.submitting
                                              : t().auth.register.submit}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
