import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { SearchIcon, MapPinIcon } from "~/components/Icons/Icons";
import { Button } from "~/components/Widgets/Button";

export function Hero() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = createSignal("");
    const [searchType, setSearchType] = createSignal<"professionals" | "establishments">("professionals");

    const handleSearch = (e: Event) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery()) params.set("q", searchQuery());
        params.set("type", searchType());
        navigate(`/explore?${params.toString()}`);
    };

    return (
        <section class="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Decorations */}
            <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10 opacity-50"></div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-tight mb-6 max-w-4xl animate-in slide-in-from-bottom-5 duration-700 delay-100">
                    Encontre os melhores <span class="text-primary">profissionais</span> perto de você.
                </h1>
                
                <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in slide-in-from-bottom-6 duration-700 delay-200">
                    Agende horários em salões, barbearias e estúdios com facilidade. Tudo em um só lugar, na palma da sua mão.
                </p>

                {/* Search Bar */}
                <div class="w-full max-w-3xl bg-card rounded-3xl p-3 md:p-4 shadow-2xl border border-border/50 flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div class="flex items-center gap-2 px-2">
                        <button
                            class={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${searchType() === "professionals" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}
                            onClick={() => setSearchType("professionals")}
                        >
                            Profissionais
                        </button>
                        <button
                            class={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${searchType() === "establishments" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"}`}
                            onClick={() => setSearchType("establishments")}
                        >
                            Estabelecimentos
                        </button>
                    </div>
                    
                    <form onSubmit={handleSearch} class="flex flex-col md:flex-row items-center gap-3 w-full">
                        <div class="flex-1 w-full relative">
                            <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                                <SearchIcon class="size-5" />
                            </div>
                            <input
                                type="text"
                                placeholder={searchType() === "professionals" ? "Qual serviço ou especialista você procura?" : "Nome do salão, clínica..."}
                                class="w-full bg-secondary/30 border border-transparent focus:border-primary/30 focus:bg-background rounded-2xl py-4 pl-12 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground/70 font-medium"
                                value={searchQuery()}
                                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            />
                        </div>
                        {/* Fake location input for aesthetics */}
                        <div class="hidden md:block w-1/3 relative">
                            <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                                <MapPinIcon class="size-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Perto de você"
                                disabled
                                class="w-full bg-secondary/30 border border-transparent rounded-2xl py-4 pl-12 pr-4 text-foreground outline-none opacity-60 cursor-not-allowed font-medium"
                            />
                        </div>
                        <Button type="submit" class="py-4 px-8 rounded-2xl text-base font-bold shadow-lg hover:shadow-primary/25 transition-all">
                            Buscar
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
