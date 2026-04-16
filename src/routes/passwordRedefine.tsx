import { createSignal, Show } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { Input } from "~/components/Widgets/Input";
import { Button } from "~/components/Widgets/Button";
import {
  ZelloIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  LockIcon,
} from "~/components/Icons/Icons";
import { theme, toggleTheme } from "~/store/appState";

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = () => searchParams.token; // Extrai o token da URL (?#token=xyz)

  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [error, setError] = createSignal("");

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return null;
    if (pass.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(pass))
      return "A senha deve conter ao menos uma letra maiúscula.";
    if (!/[0-9]/.test(pass)) return "A senha deve conter ao menos um número.";
    if (!/[!_@#$%^&*]/.test(pass))
      return "A senha deve conter um caractere especial (!@#$...).";
    return null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const strengthError = getPasswordStrength(password());
    if (strengthError) return setError(strengthError);

    if (password() !== confirmPassword()) {
      return setError("As senhas não coincidem.");
    }

    /*if (!token()) {
      return setError("Token de recuperação inválido ou ausente.");
    }
    */

    setLoading(true);
    // Simulação da chamada de API
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <main class="relative">
      <div class="flex h-screen bg-background text-foreground">
        <div class="relative hidden flex-1 flex-col items-center justify-center overflow-hidden border-r border-white/10 bg-sidebar p-8 lg:flex">
          <div class="absolute inset-0 z-0 overflow-hidden">
            <div class="absolute -right-[20%] -top-[20%] h-100 w-100 rounded-full bg-white/5" />
            <div class="absolute -bottom-[15%] -left-[15%] h-87.5 w-87.5 rounded-full bg-white/5" />
          </div>

          <div class="z-10 flex max-w-105 flex-col items-center text-center">
            <div class="mb-6 flex size-16 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground">
              <ZelloIcon/>
            </div>
            <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
              Defina sua nova senha
            </h1>
            <p class="mb-12 text-base leading-relaxed text-sidebar-foreground/80">
              Sua segurança é nossa prioridade. Escolha uma senha forte para
              proteger sua conta Zello.
            </p>
          </div>
        </div>

        <div class="relative flex flex-1 items-center justify-center bg-background px-4">
          <div class="absolute right-6 top-6 flex gap-2">
            <button class="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-foreground transition-colors hover:bg-secondary">
              <GlobeIcon/>
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
              {theme() === "dark" ? <SunIcon/> : <MoonIcon/>}
            </button>
          </div>

          <div class="flex w-full max-w-105 flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-md md:p-8">
            <Show
              when={success()}
              fallback={
                <>
                  <div class="text-left">
                    <h1 class="mb-2 text-2xl font-bold text-foreground">
                      Definir nova Senha
                    </h1>
                    <p class="text-sm text-muted-foreground">
                      Informe e confirme sua nova senha para redefinir o acesso
                      à sua conta.
                    </p>
                  </div>

                  <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <Input
                      labelText="Nova Senha"
                      type="password"
                      placeholder="••••••••"
                      value={password()}
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      validate={getPasswordStrength}
                    />

                    <Input
                      labelText="Confirmar Nova Senha"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword()}
                      onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                      error={
                        password() &&
                        confirmPassword() &&
                        password() !== confirmPassword()
                          ? "As senhas não coincidem"
                          : undefined
                      }
                    />

                    {error() && <p class="text-xs text-error">{error()}</p>}

                    <Button
                      type="submit"
                      variant="primary"
                      class="mt-2 w-full"
                      disabled={loading()}
                    >
                      {loading() ? "Processando..." : "Redefinir Senha"}
                    </Button>
                  </form>
                </>
              }
            >
              <div class="flex flex-col items-center gap-4 py-4 text-center">
                <div class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <LockIcon/>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-foreground">
                    Senha Redefinida!
                  </h2>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Sua conta foi atualizada com sucesso. Você já pode fazer
                    login.
                  </p>
                </div>
                <A href="/login" class="mt-4 w-full">
                  <Button variant="primary" class="w-full">
                    Ir para Login
                  </Button>
                </A>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </main>
  );
}
