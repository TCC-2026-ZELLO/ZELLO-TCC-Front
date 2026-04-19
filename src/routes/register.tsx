import { createSignal, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";

import { Input } from "~/components/Widgets/Input";
import { Button } from "~/components/Widgets/Button";

import {
  ZelloIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  GoogleIcon,
} from "~/components/Icons/Icons";
import { API, theme, toggleTheme } from "~/store/appState"; // Ajuste o caminho se necessário
import { type AccountType } from "~/services/auth.service"; // Ajuste o caminho se necessário

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

// ── Validações ────────────────────────────────────────────────────────────────
const validate = {
  nome: (v: string) =>
    v.trim().length < 3 ? "Informe seu nome completo" : null,
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "E-mail inválido",
  senha: (v: string) =>
    v.length < 8 ||
    !/(?=.*\d)(?=.*\W+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(v)
      ? "A senha deve ter 8+ caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais."
      : null,
  confirmar: (senha: string) => (v: string) =>
    v !== senha ? "As senhas não coincidem" : null,
};

export default function Register() {
  const navigate = useNavigate();

  // Controle de passos
  const [step, setStep] = createSignal<1 | 2>(1);

  // Passo 1
  const [accountType, setAccountType] = createSignal<AccountType>("CLIENTE");

  // Passo 2
  const [nome, setNome] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [senha, setSenha] = createSignal("");
  const [confirmar, setConfirmar] = createSignal("");
  const [termos, setTermos] = createSignal(false);

  // Submissão
  const [loading, setLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const [success, setSuccess] = createSignal(false);

  // Computa se o botão pode ser clicado
  const canSubmit = () => {
    return (
      nome().length >= 3 &&
      validate.email(email()) === null &&
      validate.senha(senha()) === null &&
      senha() === confirmar() &&
      termos()
    );
  };

  // Função Principal de Registro
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const userResponse = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome(),
          email: email(),
          password: senha(),
          termosAceitos: termos(),
          accountType: accountType(),
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        // O NestJS costuma mandar mensagens de erro num array quando falha validação do DTO
        const msg = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message;
        throw new Error(msg || "Erro ao criar conta de usuário.");
      }

      // SUCESSO E REDIRECIONAMENTO
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
        {/* LADO ESQUERDO: BANNER (Escondido em telas menores) */}
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
        <div class="relative flex flex-1 items-center justify-center bg-background px-4">
          {/* Botões de Idioma e Tema */}
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

          <div class="flex w-full max-w-105 flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-md md:p-8">
            {/* HEADER DOS PASSOS */}
            <div class="flex items-center gap-2 border-b border-border pb-4">
              <div class="flex items-center gap-2">
                <div
                  class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                  classList={{
                    "bg-green-500 text-white": step() === 2,
                    "bg-foreground text-background": step() === 1,
                  }}
                >
                  <Show when={step() === 2} fallback="1">
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
                  class="text-sm transition-colors"
                  classList={{
                    "font-semibold text-foreground": step() === 1,
                    "text-muted-foreground": step() === 2,
                  }}
                >
                  Tipo de conta
                </span>
              </div>

              <div class="mx-2 flex-1 border-t border-border" />

              <div class="flex items-center gap-2">
                <div
                  class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                  classList={{
                    "bg-foreground text-background": step() === 2,
                    "bg-muted text-muted-foreground": step() === 1,
                  }}
                >
                  2
                </div>
                <span
                  class="text-sm transition-colors"
                  classList={{
                    "font-semibold text-foreground": step() === 2,
                    "text-muted-foreground": step() === 1,
                  }}
                >
                  Seus dados
                </span>
              </div>
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
                      onClick={() => setAccountType(opt.type)}
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

            {/* PASSO 2: Formulário de Dados */}
            <Show when={step() === 2}>
              <div class="flex flex-col gap-4">
                <div class="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage("");
                    }}
                    class="mt-1 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Voltar"
                  >
                    ←
                  </button>
                  <div>
                    <h1 class="text-2xl font-bold text-foreground">
                      Seus dados
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

                <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <Input
                    labelText="Nome completo"
                    placeholder="Digite seu nome completo"
                    value={nome()}
                    onInput={(e) => setNome(e.currentTarget.value)}
                    validate={validate.nome}
                    disabled={loading()}
                  />

                  <Input
                    labelText="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    validate={validate.email}
                    disabled={loading()}
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
                    />
                    <Input
                      labelText="Confirmar"
                      type="password"
                      placeholder="Repita a senha"
                      value={confirmar()}
                      onInput={(e) => setConfirmar(e.currentTarget.value)}
                      validate={validate.confirmar(senha())}
                      disabled={loading()}
                    />
                  </div>

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

                  <Button
                    type="submit"
                    variant="primary"
                    class="mt-2 w-full"
                    disabled={loading() || !canSubmit()}
                  >
                    {loading() ? "Criando conta..." : "Criar conta →"}
                  </Button>
                </form>

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
                    window.location.href = `${API}/auth/google`;
                  }}
                >
                  <GoogleIcon />
                  Cadastrar com Google
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
          </div>
        </div>
      </div>
    </main>
  );
}
