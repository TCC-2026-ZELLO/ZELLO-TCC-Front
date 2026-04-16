import { createSignal, onCleanup, Show } from "solid-js";
import { A } from "@solidjs/router";
import { Input } from "~/components/Widgets/Input";
import { Button } from "~/components/Widgets/Button";
import {
  ZelloIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  SuccessIcon,
} from "~/components/Icons/Icons";
import { theme, toggleTheme } from "~/store/appState";

export default function PasswordRecovery() {
  const [email, setEmail] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);

  let timerId: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (timerId !== undefined) clearTimeout(timerId);
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (loading()) return;
    setLoading(true);
    timerId = setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
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
              Sua beleza, nossa prioridade
            </h1>
            <p class="mb-12 text-base leading-relaxed text-sidebar-foreground/80">
              Não se preocupe! Acontece com os melhores. Vamos te ajudar a
              recuperar seu acesso rapidamente.
            </p>

            <div class="flex w-full justify-center gap-4">
              <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div class="text-xl font-bold text-sidebar-foreground">
                  Segurança
                </div>
                <div class="mt-1 text-xs text-sidebar-foreground/70">
                  Dados Protegidos
                </div>
              </div>
              <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div class="text-xl font-bold text-sidebar-foreground">
                  Rápido
                </div>
                <div class="mt-1 text-xs text-sidebar-foreground/70">
                  Acesso Imediato
                </div>
              </div>
            </div>
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
              aria-label={
                theme() === "dark"
                  ? "Mudar para Light Mode"
                  : "Mudar para Dark Mode"
              }
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
              when={submitted()}
              fallback={
                <>
                  <div class="text-left">
                    <h1 class="mb-2 text-2xl font-bold text-foreground">
                      Esqueceu a senha?
                    </h1>
                    <p class="text-sm text-muted-foreground">
                      Informe seu e-mail e enviaremos um link seguro para você
                      redefinir sua senha.
                    </p>
                  </div>

                  <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <Input
                      labelText="E-mail cadastrado"
                      placeholder="seu@email.com"
                      type="email"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      required
                    />

                    <Button type="submit" variant="primary" class="mt-2 w-full" disabled={loading()}>
                      {loading() ? "Enviando..." : "Enviar link de recuperação"}
                    </Button>
                  </form>
                </>
              }
            >
              <div class="flex flex-col items-center gap-4 py-4 text-center">
                <div class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <SuccessIcon />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-foreground">
                    Verifique seu e-mail
                  </h2>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Se este e-mail estiver cadastrado, um link foi enviado para
                    que você possa redefinir sua senha.
                  </p>
                </div>
              </div>
            </Show>

            <div class="text-center text-sm">
              <A
                href="/login"
                class="font-semibold text-primary hover:underline"
              >
                ← Voltar para o login
              </A>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
