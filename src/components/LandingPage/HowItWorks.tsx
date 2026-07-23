import { SearchIcon, CalendarIcon, StarIcon } from "~/components/Icons/Icons";

export function HowItWorks() {
    const steps = [
        {
            icon: <SearchIcon class="size-8 text-primary" />,
            title: "Busque",
            description: "Encontre os melhores profissionais e serviços perto de você usando nossos filtros avançados."
        },
        {
            icon: <StarIcon class="size-8 text-primary" />,
            title: "Escolha",
            description: "Analise avaliações, portfólios e preços para tomar a melhor decisão para o seu momento."
        },
        {
            icon: <CalendarIcon class="size-8 text-primary" />,
            title: "Agende",
            description: "Escolha o horário perfeito e confirme seu agendamento em poucos segundos, 100% online."
        }
    ];

    return (
        <section id="como-funciona" class="py-24 bg-secondary/20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Como funciona o Zello?</h2>
                    <p class="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Simplificamos a forma como você cuida da sua beleza e bem-estar.
                    </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                    {/* Linha conectora (apenas no desktop) */}
                    <div class="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border/60 -z-10"></div>
                    
                    {steps.map((step, index) => (
                        <div class="flex flex-col items-center text-center relative group">
                            <div class="w-24 h-24 rounded-full bg-background border-4 border-background shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                                <div class="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                                {step.icon}
                                <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background font-black flex items-center justify-center text-sm shadow-md">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 class="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                            <p class="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
