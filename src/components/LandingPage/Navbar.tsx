import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { ZelloIcon, GlobeIcon, MoonIcon, SunIcon } from "~/components/Icons/Icons";
import { Button } from "~/components/Widgets/Button";
import { isAuthenticated, theme, toggleTheme } from "~/store/appState";

export function PublicHeader() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = createSignal(false);

    onMount(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        onCleanup(() => window.removeEventListener("scroll", handleScroll));
    });

    return (
        <header
            class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled()
                    ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
                    : "bg-transparent py-5"
            }`}
        >
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <A href="/" class="flex items-center gap-2 group">
                    <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                        <ZelloIcon />
                    </div>
                    <span class="font-bold text-xl md:text-2xl tracking-tight text-foreground">
                        Zello
                    </span>
                </A>

                {/* Desktop Nav */}
                <nav class="hidden md:flex items-center gap-8">
                    <a href="#como-funciona" class="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        Como Funciona
                    </a>
                    <a href="#beneficios" class="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        Para Profissionais e Empresas
                    </a>
                </nav>

                {/* Actions */}
                <div class="flex items-center gap-3">
                    <button class="hidden md:flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-foreground transition-colors hover:bg-secondary">
                        <GlobeIcon class="size-4" />
                        <span class="text-xs font-semibold">PT</span>
                    </button>
                    <button
                        class="hidden md:flex cursor-pointer items-center justify-center rounded-full border border-border bg-card p-2 text-foreground transition-colors hover:bg-secondary"
                        onClick={toggleTheme}
                        title={
                            theme() === "dark"
                                ? "Mudar para Light Mode"
                                : "Mudar para Dark Mode"
                        }
                    >
                        {theme() === "dark" ? <SunIcon class="size-4" /> : <MoonIcon class="size-4" />}
                    </button>
                    
                    <Show
                        when={isAuthenticated()}
                        fallback={
                            <>
                                <Button variant="ghost" class="hidden sm:inline-flex text-sm font-semibold" onClick={() => navigate("/login")}>
                                    Entrar
                                </Button>
                                <Button class="text-sm font-bold shadow-md hover:shadow-lg transition-all" onClick={() => navigate("/register")}>
                                    Cadastrar-se
                                </Button>
                            </>
                        }
                    >
                        <Button class="text-sm font-bold shadow-md hover:shadow-lg transition-all" onClick={() => navigate("/explore")}>
                            Ir para Dashboard
                        </Button>
                    </Show>
                </div>
            </div>
        </header>
    );
}
