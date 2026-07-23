import { Button } from "~/components/Widgets/Button";
import { HeartIcon, BriefcaseIcon, CheckCircleIcon } from "~/components/Icons/Icons";
import { useNavigate } from "@solidjs/router";

export function Benefits() {
    const navigate = useNavigate();

    return (
        <section id="beneficios" class="py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Imagem / Visual */}
                    <div class="relative w-full h-[500px] bg-gradient-to-br from-primary/20 to-secondary/30 rounded-3xl overflow-hidden p-8 flex items-center justify-center border border-border">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                        <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                        
                        <div class="bg-background/80 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div class="flex items-center gap-4 border-b border-border/50 pb-4">
                                <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <BriefcaseIcon class="size-6 text-primary" />
                                </div>
                                <div>
                                    <h4 class="font-bold text-foreground">Gestão Completa</h4>
                                    <p class="text-xs text-muted-foreground">Tudo em um só lugar</p>
                                </div>
                            </div>
                            <ul class="space-y-3">
                                {[
                                    "Agenda Inteligente",
                                    "Dashboard e Histórico",
                                    "Gestão com base em dados",
                                    "Visibilidade Zello"
                                ].map((item) => (
                                    <li class="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                        <CheckCircleIcon class="size-4 text-primary" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Texto CTA */}
                    <div class="flex flex-col gap-6">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground w-fit text-sm font-bold">
                            <HeartIcon class="size-4" /> Para Profissionais e Empresas
                        </div>
                        
                        <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                            Leve o seu negócio para o <span class="text-primary">próximo nível</span>.
                        </h2>
                        
                        <p class="text-lg text-muted-foreground">
                            Pare de perder tempo com agendamentos manuais e planilhas confusas. 
                            O Zello automatiza sua rotina para que você foque no que faz de melhor: encantar seus clientes.
                        </p>
                        
                        <div class="flex items-center gap-4 mt-4">
                            <Button size="lg" class="px-8 font-bold shadow-xl hover:shadow-primary/30" onClick={() => navigate("/register")}>
                                Cadastrar meu Negócio
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
