import { createSignal, createEffect, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";

import { Input } from "../components/Widgets/Input";
import { Button } from "../components/Widgets/Button";
import { MaskedInput } from "../components/Widgets/MaskedInput";
import { PhotoUpload } from "../components/Widgets/PhotoUpload";

import {
  ZelloIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  GoogleIcon,
} from "../components/Icons/Icons";
import { API, theme, toggleTheme } from "../store/appState";
import { type AccountType } from "../services/auth.service";

import { fetchAddressByCep } from "../services/viacep.service";
import { fetchCnpjData } from "../services/cnpj.service";
import { validateCpf, validateCnpj, validatePhone, validateCep } from "../utils/validators";

const ACCOUNT_OPTIONS: {
  type: AccountType;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    type: "CLIENTE",
    label: "Cliente",
    description: "Agendar serviços",
    emoji: "👤",
  },
  {
    type: "PROFISSIONAL",
    label: "Profissional",
    description: "Atender clientes",
    emoji: "💼",
  },
  {
    type: "ESTABELECIMENTO",
    label: "Estabelecimento",
    description: "Gerir uma equipe",
    emoji: "🏢",
  },
];

const validate = {
  nome: (v: string) =>
    v.trim().length < 3 ? "Informe um nome válido" : null,
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "E-mail inválido",
  senha: (v: string) =>
    v.length < 8 ||
    !/(?=.*\d)(?=.*\W+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(v)
      ? "A senha deve ter 8+ caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais."
      : null,
  confirmar: (senha: string) => (v: string) =>
    v !== senha ? "As senhas não coincidem" : null,
  endereco: (v: string) => {
    if (!v) return null;
    return v.trim().length < 2 ? "Muito curto" : null;
  },
  numero: (v: string) => {
    if (!v) return null;
    if (v.trim().length === 0) return "Obrigatório";
    return /^\d+$/.test(v.trim()) ? null : "Apenas números";
  },
  cidade: (v: string) => {
    if (!v) return null;
    return /^[a-zA-ZÀ-ÿ\s'-]{2,}$/.test(v.trim()) ? null : "Cidade inválida";
  },
  uf: (v: string) => {
    if (!v) return null;
    return /^[a-zA-Z]{2}$/.test(v.trim()) ? null : "UF inválida (ex: SP)";
  },
};

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = createSignal<number>(1);
  const [accountType, setAccountType] = createSignal<AccountType>("CLIENTE");

  const [nome, setNome] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [senha, setSenha] = createSignal("");
  const [confirmar, setConfirmar] = createSignal("");
  const [termos, setTermos] = createSignal(false);
  
  const [phone, setPhone] = createSignal("");
  const [cpf, setCpf] = createSignal("");
  const [photo, setPhoto] = createSignal<File | null>(null);

  // Professional
  const [specialty, setSpecialty] = createSignal("");
  const [biography, setBiography] = createSignal("");

  // Establishment
  const [cnpj, setCnpj] = createSignal("");
  const [legalName, setLegalName] = createSignal("");
  const [fantasia, setFantasia] = createSignal("");
  const [businessPhone, setBusinessPhone] = createSignal("");

  // Address
  const [cep, setCep] = createSignal("");
  const [street, setStreet] = createSignal("");
  const [addressNumber, setAddressNumber] = createSignal("");
  const [complement, setComplement] = createSignal("");
  const [neighborhood, setNeighborhood] = createSignal("");
  const [city, setCity] = createSignal("");
  const [uf, setUf] = createSignal("");
  const [cepLoading, setCepLoading] = createSignal(false);
  const [cnpjLoading, setCnpjLoading] = createSignal(false);

  const [loading, setLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [success, setSuccess] = createSignal(false);

  const totalSteps = () => (accountType() === "ESTABELECIMENTO" ? 4 : 3);
  
  const stepLabels = () => {
    if (accountType() === "CLIENTE") return ["Tipo de conta", "Dados pessoais", "Endereço"];
    if (accountType() === "PROFISSIONAL") return ["Tipo de conta", "Dados pessoais", "Perfil profissional"];
    return ["Tipo de conta", "Responsável", "Empresa", "Endereço"];
  };

  createEffect(() => {
    const cepVal = cep();
    if (cepVal.replace(/\D/g, "").length === 8) {
      setCepLoading(true);
      fetchAddressByCep(cepVal).then((data) => {
        if (data) {
          setStreet(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
          setUf(data.uf);
        }
        setCepLoading(false);
      });
    }
  });

  createEffect(() => {
    const cnpjVal = cnpj();
    if (cnpjVal.replace(/\D/g, "").length === 14) {
      setCnpjLoading(true);
      fetchCnpjData(cnpjVal, API).then((data) => {
        if (data) {
          setLegalName(data.nome);
          setFantasia(data.fantasia);
        }
        setCnpjLoading(false);
      });
    }
  });

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    // Reset fields when type changes, but keep shared ones
    setCpf("");
    setPhoto(null);
    setSpecialty("");
    setBiography("");
    setCnpj("");
    setLegalName("");
    setFantasia("");
    setBusinessPhone("");
    setCep("");
    setStreet("");
    setAddressNumber("");
    setComplement("");
    setNeighborhood("");
    setCity("");
    setUf("");
  };

  const canAdvance = () => {
    const currentStep = step();
    
    if (currentStep === 1) return true;
    
    if (currentStep === 2) {
      const isNomeValid = nome().trim().length >= 3;
      const isEmailValid = validate.email(email()) === null;
      const isPhoneValid = validatePhone(phone()) === null;
      const isSenhaValid = validate.senha(senha()) === null;
      const isConfirmarValid = senha() === confirmar();
      
      if (accountType() !== "ESTABELECIMENTO") {
        const isCpfValid = validateCpf(cpf()) === null;
        return isNomeValid && isEmailValid && isPhoneValid && isCpfValid && isSenhaValid && isConfirmarValid;
      } else {
        return isNomeValid && isEmailValid && isPhoneValid && isSenhaValid && isConfirmarValid;
      }
    }
    
    if (currentStep === 3) {
      if (accountType() === "CLIENTE") {
        const hasAddress = cep() || street() || addressNumber() || neighborhood() || city() || uf();
        if (hasAddress) {
          const isValid = cep() && validateCep(cep()) === null && 
               street() && validate.endereco(street()) === null && 
               addressNumber() && validate.numero(addressNumber()) === null && 
               neighborhood() && validate.endereco(neighborhood()) === null && 
               city() && validate.cidade(city()) === null && 
               uf() && validate.uf(uf()) === null;
          return !!isValid && termos();
        }
        return termos();
      }
      if (accountType() === "PROFISSIONAL") {
        return specialty().trim().length > 0 && termos();
      }
      if (accountType() === "ESTABELECIMENTO") {
        return validateCnpj(cnpj()) === null && legalName().trim().length > 0;
      }
    }
    
    if (currentStep === 4) {
      if (accountType() === "ESTABELECIMENTO") {
        return !!(cep() && validateCep(cep()) === null && 
               street() && validate.endereco(street()) === null && 
               addressNumber() && validate.numero(addressNumber()) === null && 
               neighborhood() && validate.endereco(neighborhood()) === null && 
               city() && validate.cidade(city()) === null && 
               uf() && validate.uf(uf()) === null && 
               termos());
      }
    }
    
    return false;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (step() < totalSteps()) {
      setStep(step() + 1);
      return;
    }
    
    setErrorMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nome", nome());
      formData.append("email", email());
      formData.append("password", senha());
      formData.append("termosAceitos", "true");
      formData.append("accountType", accountType());
      formData.append("phone", phone());

      if (accountType() !== "ESTABELECIMENTO") {
        formData.append("cpf", cpf());
      }

      if (accountType() === "PROFISSIONAL") {
        formData.append("specialty", specialty());
        if (biography()) formData.append("biography", biography());
      }

      if (accountType() === "ESTABELECIMENTO") {
        formData.append("cnpj", cnpj());
        formData.append("legalName", legalName());
        if (fantasia()) formData.append("tradeName", fantasia());
        if (businessPhone()) formData.append("businessPhone", businessPhone());
        formData.append("zipCode", cep());
        formData.append("street", street());
        formData.append("addressNumber", addressNumber());
        if (complement()) formData.append("complement", complement());
        formData.append("neighborhood", neighborhood());
        formData.append("city", city());
        formData.append("state", uf());
      }

      if (accountType() === "CLIENTE" && cep()) {
        formData.append("clientZipCode", cep());
        if (street()) formData.append("clientStreet", street());
        if (addressNumber()) formData.append("clientNumber", addressNumber());
        if (complement()) formData.append("clientComplement", complement());
        if (neighborhood()) formData.append("clientNeighborhood", neighborhood());
        if (city()) formData.append("clientCity", city());
        if (uf()) formData.append("clientState", uf());
      }

      if (photo()) {
        formData.append("photo", photo()!);
      }

      const userResponse = await fetch(`${API}/users`, {
        method: "POST",
        body: formData,
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        const msg = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message;
        throw new Error(msg || "Erro ao criar conta de usuário.");
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main class="relative">
      <div class="flex h-screen bg-background">
        {/* LADO ESQUERDO: BANNER */}
        <div class="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-white/10 bg-sidebar p-8 lg:flex">
          <div class="absolute inset-0 z-0 overflow-hidden">
            <div class="absolute -right-[20%] -top-[20%] h-100 w-100 rounded-full bg-white/5" />
            <div class="absolute -bottom-[15%] -left-[15%] h-87.5 w-87.5 rounded-full bg-white/5" />
          </div>

          <div class="z-10 flex max-w-105 flex-col items-center text-center">
            <div class="mb-6 flex size-16 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground">
              <ZelloIcon />
            </div>

            <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
              Comece agora no Zello
            </h1>
            <p class="mb-12 text-base leading-relaxed text-sidebar-foreground/80">
              Crie sua conta e conecte-se aos melhores profissionais de beleza e
              estética da sua cidade.
            </p>

            <div class="flex w-full justify-center gap-4">
              <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div class="text-xl font-bold text-sidebar-foreground">
                  2.400+
                </div>
                <div class="mt-1 text-xs text-sidebar-foreground/70">
                  Profissionais
                </div>
              </div>
              <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div class="text-xl font-bold text-sidebar-foreground">
                  18k+
                </div>
                <div class="mt-1 text-xs text-sidebar-foreground/70">
                  Clientes
                </div>
              </div>
              <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div class="text-xl font-bold text-sidebar-foreground">
                  4.9 ★
                </div>
                <div class="mt-1 text-xs text-sidebar-foreground/70">
                  Avaliação
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO */}
        <div class="relative flex flex-1 items-center justify-center bg-background px-4 overflow-y-auto py-10">
          <div class="absolute right-6 top-6 flex gap-2">
            <button class="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-foreground transition-colors hover:bg-secondary">
              <GlobeIcon />
              <span class="text-xs font-semibold">PT</span>
            </button>
            <button
              class="flex cursor-pointer items-center justify-center rounded-full border border-border bg-card p-2 text-foreground transition-colors hover:bg-secondary"
              onClick={toggleTheme}
              title={
                theme() === "dark"
                  ? "Mudar para Light Mode"
                  : "Mudar para Dark Mode"
              }
            >
              {theme() === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <div class="flex w-full max-w-xl flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-md md:p-8 mt-12 mb-12">
            {/* HEADER DOS PASSOS */}
            <div class="flex items-center justify-between border-b border-border pb-4 w-full">
              {Array.from({ length: totalSteps() }).map((_, i) => {
                const s = i + 1;
                return (
                  <>
                    <div class="flex items-center gap-2">
                      <div
                        class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                        classList={{
                          "bg-green-500 text-white": step() > s,
                          "bg-foreground text-background": step() === s,
                          "bg-muted text-muted-foreground": step() < s,
                        }}
                      >
                        <Show when={step() > s} fallback={s}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </Show>
                      </div>
                      <span
                        class="text-sm transition-colors whitespace-nowrap"
                        classList={{
                          "font-semibold text-foreground block": step() === s,
                          "hidden": step() !== s,
                        }}
                      >
                        {stepLabels()[i]}
                      </span>
                    </div>
                    {i < totalSteps() - 1 && (
                      <div class="mx-2 flex-1 border-t border-border" />
                    )}
                  </>
                );
              })}
            </div>

            {/* PASSO 1: Escolha do Tipo de Conta */}
            <Show when={step() === 1}>
              <div class="flex flex-col gap-5">
                <div>
                  <h1 class="mb-1 text-2xl font-bold text-foreground">
                    Criar nova conta
                  </h1>
                  <p class="text-sm text-muted-foreground">
                    Escolha como você quer usar o Zello
                  </p>
                </div>

                <div class="flex flex-col gap-3">
                  {ACCOUNT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      onClick={() => handleAccountTypeChange(opt.type)}
                      class="flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors"
                      classList={{
                        "border-foreground bg-secondary/40":
                          accountType() === opt.type,
                        "border-border hover:border-border/60 hover:bg-secondary/20":
                          accountType() !== opt.type,
                      }}
                    >
                      <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-lg">
                        {opt.emoji}
                      </div>
                      <div class="flex-1">
                        <p class="font-semibold text-foreground">{opt.label}</p>
                        <p class="text-sm text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                      <div
                        class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                        classList={{
                          "border-foreground bg-foreground":
                            accountType() === opt.type,
                          "border-border": accountType() !== opt.type,
                        }}
                      >
                        <Show when={accountType() === opt.type}>
                          <div class="h-2 w-2 rounded-full bg-background" />
                        </Show>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  class="mt-2 w-full"
                  onClick={() => setStep(2)}
                >
                  Continuar →
                </Button>

                <div class="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <A
                    href="/login"
                    class="font-bold text-primary hover:underline"
                  >
                    Fazer login
                  </A>
                </div>
              </div>
            </Show>

            {/* PASSO 2 ou MAIS: Formulários */}
            <Show when={step() > 1}>
              <div class="flex flex-col gap-4">
                <div class="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(step() - 1);
                      setErrorMessage("");
                    }}
                    class="mt-1 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Voltar"
                  >
                    ←
                  </button>
                  <div>
                    <h1 class="text-2xl font-bold text-foreground">
                      {stepLabels()[step() - 1]}
                    </h1>
                    <p class="text-sm text-muted-foreground">
                      Conta{" "}
                      {
                        ACCOUNT_OPTIONS.find((o) => o.type === accountType())
                          ?.label
                      }
                    </p>
                  </div>
                </div>

                {/* Mensagens de Sucesso / Erro */}
                <Show when={success()}>
                  <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✓ Conta criada com sucesso! Redirecionando para o login...
                  </div>
                </Show>

                <Show when={errorMessage()}>
                  <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {errorMessage()}
                  </div>
                </Show>

                <Show when={step() === 2}>
                  <div class="rounded-xl bg-sidebar p-4 shadow-sm">
                    <p class="text-xs text-sidebar-foreground/80 leading-relaxed text-left">
                      <strong class="text-sidebar-foreground">
                        Dica de Vinculação:
                      </strong>{" "}
                      Se você já possui uma conta no Zello e quer habilitar este
                      novo perfil, preencha os dados usando{" "}
                      <strong class="text-sidebar-foreground">
                        exatamente a sua Senha e E-mail atuais
                      </strong>
                      . O novo perfil será automaticamente integrado na sua mesma
                      conta!
                    </p>
                  </div>
                </Show>

                <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                  {/* STEP 2 - CLIENTE / PROFISSIONAL */}
                  <Show when={step() === 2 && accountType() !== "ESTABELECIMENTO"}>
                    <div class="mb-2">
                      <label class="mb-1 block text-sm font-semibold text-foreground text-center">
                        Foto de Perfil (Opcional)
                      </label>
                      <PhotoUpload
                        file={photo()}
                        onFileChange={setPhoto}
                        disabled={loading()}
                      />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        labelText="Nome completo"
                        placeholder="Digite seu nome completo"
                        value={nome()}
                        onInput={(e) => setNome(e.currentTarget.value)}
                        validate={validate.nome}
                        disabled={loading()}
                        required
                      />
                      <Input
                        labelText="E-mail"
                        type="email"
                        placeholder="seu@email.com"
                        value={email()}
                        onInput={(e) => setEmail(e.currentTarget.value)}
                        validate={validate.email}
                        disabled={loading()}
                        required
                      />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MaskedInput
                        mask="phone"
                        labelText="Telefone"
                        placeholder="(00) 00000-0000"
                        value={phone()}
                        onInput={(val) => setPhone(val)}
                        error={phone() ? validatePhone(phone()) : null}
                        disabled={loading()}
                        required
                      />
                      <MaskedInput
                        mask="cpf"
                        labelText="CPF"
                        placeholder="000.000.000-00"
                        value={cpf()}
                        onInput={(val) => setCpf(val)}
                        error={cpf() ? validateCpf(cpf()) : null}
                        disabled={loading()}
                        required
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <Input
                        labelText="Senha"
                        type="password"
                        placeholder="Mín. 8 caracteres"
                        value={senha()}
                        onInput={(e) => setSenha(e.currentTarget.value)}
                        validate={validate.senha}
                        disabled={loading()}
                        required
                      />
                      <Input
                        labelText="Confirmar"
                        type="password"
                        placeholder="Repita a senha"
                        value={confirmar()}
                        onInput={(e) => setConfirmar(e.currentTarget.value)}
                        validate={validate.confirmar(senha())}
                        disabled={loading()}
                        required
                      />
                    </div>
                  </Show>

                  {/* STEP 2 - ESTABELECIMENTO */}
                  <Show when={step() === 2 && accountType() === "ESTABELECIMENTO"}>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        labelText="Nome do responsável"
                        placeholder="Nome completo do responsável"
                        value={nome()}
                        onInput={(e) => setNome(e.currentTarget.value)}
                        validate={validate.nome}
                        disabled={loading()}
                        required
                      />
                      <Input
                        labelText="E-mail do responsável"
                        type="email"
                        placeholder="seu@email.com"
                        value={email()}
                        onInput={(e) => setEmail(e.currentTarget.value)}
                        validate={validate.email}
                        disabled={loading()}
                        required
                      />
                    </div>
                    <MaskedInput
                      mask="phone"
                      labelText="Telefone do responsável"
                      placeholder="(00) 00000-0000"
                      value={phone()}
                      onInput={(val) => setPhone(val)}
                      error={phone() ? validatePhone(phone()) : null}
                      disabled={loading()}
                      required
                    />
                    <div class="grid grid-cols-2 gap-3">
                      <Input
                        labelText="Senha"
                        type="password"
                        placeholder="Mín. 8 caracteres"
                        value={senha()}
                        onInput={(e) => setSenha(e.currentTarget.value)}
                        validate={validate.senha}
                        disabled={loading()}
                        required
                      />
                      <Input
                        labelText="Confirmar"
                        type="password"
                        placeholder="Repita a senha"
                        value={confirmar()}
                        onInput={(e) => setConfirmar(e.currentTarget.value)}
                        validate={validate.confirmar(senha())}
                        disabled={loading()}
                        required
                      />
                    </div>
                  </Show>

                  {/* STEP 3 - CLIENTE */}
                  <Show when={step() === 3 && accountType() === "CLIENTE"}>
                    <div>
                      <h2 class="text-lg font-bold text-foreground">Endereço (opcional)</h2>
                      <p class="text-sm text-muted-foreground mb-4">
                        Para encontrar profissionais perto de você
                      </p>
                    </div>
                    
                    <MaskedInput
                      mask="cep"
                      labelText="CEP"
                      placeholder="00000-000"
                      value={cep()}
                      onInput={(val) => setCep(val)}
                      error={cep() ? validateCep(cep()) : null}
                      disabled={loading() || cepLoading()}
                    />
                    <Input
                      labelText="Logradouro"
                      placeholder="Rua, Avenida, etc."
                      value={street()}
                      onInput={(e) => setStreet(e.currentTarget.value)}
                      validate={validate.endereco}
                      disabled={loading()}
                    />
                    <div class="grid grid-cols-2 gap-3">
                      <Input
                        labelText="Número"
                        placeholder="Nº"
                        value={addressNumber()}
                        onInput={(e) => setAddressNumber(e.currentTarget.value)}
                        validate={validate.numero}
                        disabled={loading()}
                      />
                      <Input
                        labelText="Complemento"
                        placeholder="Apto, Sala (opcional)"
                        value={complement()}
                        onInput={(e) => setComplement(e.currentTarget.value)}
                        disabled={loading()}
                      />
                    </div>
                    <Input
                      labelText="Bairro"
                      placeholder="Seu bairro"
                      value={neighborhood()}
                      onInput={(e) => setNeighborhood(e.currentTarget.value)}
                      validate={validate.endereco}
                      disabled={loading()}
                    />
                    <div class="grid grid-cols-2 gap-3">
                      <Input
                        labelText="Cidade"
                        placeholder="Sua cidade"
                        value={city()}
                        onInput={(e) => setCity(e.currentTarget.value)}
                        validate={validate.cidade}
                        disabled={loading()}
                      />
                      <Input
                        labelText="UF"
                        placeholder="Estado"
                        value={uf()}
                        onInput={(e) => setUf(e.currentTarget.value)}
                        validate={validate.uf}
                        disabled={loading()}
                      />
                    </div>
                  </Show>

                  {/* STEP 3 - PROFISSIONAL */}
                  <Show when={step() === 3 && accountType() === "PROFISSIONAL"}>
                    <div>
                      <label class="mb-1 block text-sm font-semibold text-foreground">
                        Especialidade <span class="text-red-500">*</span>
                      </label>
                      <select
                        class="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
                        value={specialty()}
                        onChange={(e) => setSpecialty(e.currentTarget.value)}
                        disabled={loading()}
                        required
                      >
                        <option value="" disabled selected>Selecione uma especialidade</option>
                        <option value="Cabeleireiro(a)">Cabeleireiro(a)</option>
                        <option value="Barbeiro(a)">Barbeiro(a)</option>
                        <option value="Manicure/Pedicure">Manicure/Pedicure</option>
                        <option value="Esteticista">Esteticista</option>
                        <option value="Maquiador(a)">Maquiador(a)</option>
                        <option value="Designer de Sobrancelhas">Designer de Sobrancelhas</option>
                        <option value="Depilador(a)">Depilador(a)</option>
                        <option value="Massagista">Massagista</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label class="mb-1 block text-sm font-semibold text-foreground">
                        Biografia curta (opcional)
                      </label>
                      <textarea
                        class="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none resize-none"
                        rows="3"
                        maxLength="280"
                        placeholder="Conte um pouco sobre seu trabalho..."
                        value={biography()}
                        onInput={(e) => setBiography(e.currentTarget.value)}
                        disabled={loading()}
                      />
                    </div>
                  </Show>

                  {/* STEP 3 - ESTABELECIMENTO */}
                  <Show when={step() === 3 && accountType() === "ESTABELECIMENTO"}>
                    <div class="mb-2">
                      <label class="mb-1 block text-sm font-semibold text-foreground text-center">
                        Foto da Empresa (Opcional)
                      </label>
                      <PhotoUpload
                        file={photo()}
                        onFileChange={setPhoto}
                        disabled={loading()}
                      />
                    </div>
                    <MaskedInput
                      mask="cnpj"
                      labelText="CNPJ"
                      placeholder="00.000.000/0000-00"
                      value={cnpj()}
                      onInput={(val) => setCnpj(val)}
                      error={cnpj() ? validateCnpj(cnpj()) : null}
                      disabled={loading() || cnpjLoading()}
                      required
                    />
                    <Input
                      labelText="Razão Social"
                      placeholder="Razão Social"
                      value={legalName()}
                      onInput={(e) => setLegalName(e.currentTarget.value)}
                      disabled={loading()}
                      required
                    />
                    <Input
                      labelText="Nome Fantasia (Opcional)"
                      placeholder="Nome Fantasia"
                      value={fantasia()}
                      onInput={(e) => setFantasia(e.currentTarget.value)}
                      disabled={loading()}
                    />
                  </Show>

                  {/* STEP 4 - ESTABELECIMENTO */}
                  <Show when={step() === 4 && accountType() === "ESTABELECIMENTO"}>
                    <MaskedInput
                      mask="cep"
                      labelText="CEP"
                      placeholder="00000-000"
                      value={cep()}
                      onInput={(val) => setCep(val)}
                      error={cep() ? validateCep(cep()) : null}
                      disabled={loading() || cepLoading()}
                      required
                    />
                    <Input
                      labelText="Logradouro"
                      placeholder="Rua, Avenida, etc."
                      value={street()}
                      onInput={(e) => setStreet(e.currentTarget.value)}
                      validate={validate.endereco}
                      disabled={loading()}
                      required
                    />
                    <div class="grid grid-cols-2 gap-3">
                      <Input
                        labelText="Número"
                        placeholder="Nº"
                        value={addressNumber()}
                        onInput={(e) => setAddressNumber(e.currentTarget.value)}
                        validate={validate.numero}
                        disabled={loading()}
                        required
                      />
                      <Input
                        labelText="Complemento (Opcional)"
                        placeholder="Apto, Sala"
                        value={complement()}
                        onInput={(e) => setComplement(e.currentTarget.value)}
                        disabled={loading()}
                      />
                    </div>
                    <Input
                      labelText="Bairro"
                      placeholder="Seu bairro"
                      value={neighborhood()}
                      onInput={(e) => setNeighborhood(e.currentTarget.value)}
                      validate={validate.endereco}
                      disabled={loading()}
                      required
                    />
                    <div class="grid grid-cols-2 gap-3">
                      <Input
                        labelText="Cidade"
                        placeholder="Sua cidade"
                        value={city()}
                        onInput={(e) => setCity(e.currentTarget.value)}
                        validate={validate.cidade}
                        disabled={loading()}
                        required
                      />
                      <Input
                        labelText="UF"
                        placeholder="Estado"
                        value={uf()}
                        onInput={(e) => setUf(e.currentTarget.value)}
                        validate={validate.uf}
                        disabled={loading()}
                        required
                      />
                    </div>
                  </Show>

                  <Show when={(step() === 3 && accountType() !== "ESTABELECIMENTO") || (step() === 4 && accountType() === "ESTABELECIMENTO")}>
                    <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
                      <input
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 flex-shrink-0 accent-foreground"
                        checked={termos()}
                        onChange={(e) => setTermos(e.currentTarget.checked)}
                      />
                      <span class="text-sm leading-relaxed text-muted-foreground">
                        Aceito os{" "}
                        <A
                          href="/termos"
                          class="font-semibold text-foreground hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Termos e Condições de Uso
                        </A>{" "}
                        e a{" "}
                        <A
                          href="/privacidade"
                          class="font-semibold text-foreground hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Política de Privacidade
                        </A>{" "}
                        da plataforma Zello.
                      </span>
                    </label>
                  </Show>

                  <Button
                    type="submit"
                    variant="primary"
                    class="mt-2 w-full"
                    disabled={loading() || !canAdvance()}
                  >
                    {loading() ? "Processando..." : step() < totalSteps() ? "Continuar →" : "Criar conta →"}
                  </Button>
                </form>

                <Show when={step() === totalSteps()}>
                  <div class="flex items-center gap-3 text-xs text-muted-foreground">
                    <div class="h-px flex-1 bg-border" />
                    ou cadastre com
                    <div class="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    variant="outline"
                    class="w-full"
                    disabled={loading()}
                    onClick={() => {
                      window.location.href = `${API}/auth/google?role=${accountType()}`;
                    }}
                  >
                    <GoogleIcon />
                    Cadastrar com Google
                  </Button>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </main>
  );
}
