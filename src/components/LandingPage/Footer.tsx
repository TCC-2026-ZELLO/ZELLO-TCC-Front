import { ZelloIcon } from "../../components/Icons/Icons";

export function Footer() {
    return (
        <footer class="bg-background border-t border-border pt-16 pb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <ZelloIcon />
                            </div>
                            <span class="font-bold text-xl tracking-tight text-foreground">Zello</span>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            A plataforma que conecta você aos melhores profissionais de beleza e bem-estar.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="font-bold text-foreground mb-2">Para Clientes</h4>
                        <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">Buscar Serviços</a>
                        <a href="/register" class="text-sm text-muted-foreground hover:text-primary transition-colors">Criar Conta</a>
                        <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</a>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="font-bold text-foreground mb-2">Para Profissionais e Empresas</h4>
                        <a href="/register" class="text-sm text-muted-foreground hover:text-primary transition-colors">Cadastrar como Profissional</a>
                        <a href="/register" class="text-sm text-muted-foreground hover:text-primary transition-colors">Cadastrar Estabelecimento</a>
                        <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">Planos e Preços</a>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="font-bold text-foreground mb-2">Legal</h4>
                        <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a>
                        <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">Privacidade</a>
                        <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</a>
                    </div>
                </div>

                <div class="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p class="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Zello. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
