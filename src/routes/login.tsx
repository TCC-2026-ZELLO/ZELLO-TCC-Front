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
import { theme, toggleTheme } from "~/store/appState";
import {login} from "~/services/auth.service";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [errorMessage, setErrorMessage] = createSignal("");

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            await login({
                email: email(),
                password: password()
            });

            navigate("/explore");

        } catch (error: any) {
            setErrorMessage(error.message || "Erro ao fazer login. Tente novamente.");
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
                        <div class="absolute -right-[20%] -top-[20%] h-100 w-100 rounded-full bg-white/5"/>
                        <div class="absolute -bottom-[15%] -left-[15%] h-87.5 w-87.5 rounded-full bg-white/5"/>
                    </div>

                    <div class="z-10 flex max-w-105 flex-col items-center text-center">
                        <div class="mb-6 flex size-16 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground">
                            <ZelloIcon/>
                        </div>

                        <h1 class="mb-4 text-3xl font-bold text-sidebar-foreground">
                            Bem-vindo ao Zello
                        </h1>
                        <p class="mb-12 text-base leading-relaxed text-sidebar-foreground/80">
                            A plataforma premium que conecta você aos melhores profissionais
                            de beleza e estética da sua cidade.
                        </p>

                        <div class="flex w-full justify-center gap-4">
                            <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                                <div class="text-xl font-bold text-sidebar-foreground">2.400+</div>
                                <div class="mt-1 text-xs text-sidebar-foreground/70">Profissionais</div>
                            </div>
                            <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                                <div class="text-xl font-bold text-sidebar-foreground">18k+</div>
                                <div class="mt-1 text-xs text-sidebar-foreground/70">Clientes</div>
                            </div>
                            <div class="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                                <div class="text-xl font-bold text-sidebar-foreground">4.9 ★</div>
                                <div class="mt-1 text-xs text-sidebar-foreground/70">Avaliação</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO: FORMULÁRIO */}
                <div class="relative flex flex-1 items-center justify-center bg-background px-4">

                    {/* Botões Topo */}
                    <div class="absolute right-6 top-6 flex gap-2">
                        <button class="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-foreground transition-colors hover:bg-secondary">
                            <GlobeIcon/>
                            <span class="text-xs font-semibold">PT</span>
                        </button>
                        <button
                            class="flex cursor-pointer items-center justify-center rounded-full border border-border bg-card p-2 text-foreground transition-colors hover:bg-secondary"
                            onClick={toggleTheme}
                            title={theme() === "dark" ? "Mudar para Light Mode" : "Mudar para Dark Mode"}
                        >
                            {theme() === "dark" ? <SunIcon/> : <MoonIcon/>}
                        </button>
                    </div>

                    <div class="flex w-full max-w-105 flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-md md:p-8">
                        <div class="text-left">
                            <h1 class="mb-2 text-2xl font-bold text-foreground">
                                Entrar na sua conta
                            </h1>
                            <p class="text-sm text-muted-foreground">
                                Acesse com suas credenciais para continuar
                            </p>
                        </div>

                        <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <Input
                                labelText="E-mail"
                                placeholder="seu@email.com"
                                type="email"
                                value={email()}
                                onInput={(e) => setEmail(e.currentTarget.value)}
                                disabled={loading()}
                            />

                            <div class="relative">
                                <A href="/passwordRecovery" class="absolute right-0 top-0 text-xs font-semibold text-primary hover:underline">
                                    Esqueceu a senha?
                                </A>
                                <Input
                                    labelText="Senha"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password()}
                                    onInput={(e) => setPassword(e.currentTarget.value)}
                                    disabled={loading()}
                                />
                            </div>

                            {/* Tratamento visual do erro do NestJS */}
                            <Show when={errorMessage()}>
                                <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {errorMessage()}
                                </div>
                            </Show>

                            <Button
                                type="submit"
                                variant="primary"
                                class="mt-2 w-full"
                                disabled={loading() || email().length === 0 || password().length === 0}
                            >
                                {loading() ? "Autenticando..." : "Entrar →"}
                            </Button>
                        </form>

                        <div class="flex items-center gap-3 text-xs text-muted-foreground">
                            <div class="h-px flex-1 bg-border"/>
                            ou continue com
                            <div class="h-px flex-1 bg-border"/>
                        </div>

                        <Button 
                            variant="outline" 
                            class="w-full" 
                            disabled={loading()}
                            onClick={() => {
                                window.location.href = "http://localhost:3001/auth/google";
                            }}
                        >
                            <GoogleIcon/>
                            Entrar com Google
                        </Button>

                        <div class="text-center text-sm text-muted-foreground">
                            Não tem uma conta?{" "}
                            <A href="/register" class="font-bold text-primary hover:underline">
                                Cadastre-se grátis
                            </A>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}