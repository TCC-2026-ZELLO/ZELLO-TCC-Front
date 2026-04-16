import { Badge } from "~/components/Widgets/Badge";
import { Button } from "~/components/Widgets/Button";

// Adicionei o currentUser aqui
import { accountRole, idioma, theme, toggleRole, toggleTheme, t, toggleSidebar, currentUser } from "~/store/appState";
import { MenuIcon, GlobeIcon, SunIcon, MoonIcon, ChevronDownIcon, BellIcon } from "~/components/Icons/Icons";

export function Header() {
    return (
        <header class="h-18 bg-card border-b border-border flex items-center justify-between px-8 transition-all duration-200">
            <div class="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    class="bg-transparent border-none cursor-pointer text-foreground hover:opacity-70 transition-opacity"
                >
                    <MenuIcon/>
                </button>

                <div class="flex flex-col justify-center">
                    <span class="font-bold text-sm text-foreground leading-tight">
                        {t().header.home}
                    </span>
                    <div class="mt-1">
                        <Badge variant={"error"}>
                            {accountRole() === "cliente"
                                ? `${t().header.badgeClient} · ${currentUser()?.name?.split(' ')[0] || "Visitante"}`
                                : `${t().header.badgeProf} · ${currentUser()?.name?.split(' ')[0] || "Visitante"}`
                            }
                        </Badge>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-sm font-medium text-foreground">
                    <span class="opacity-70"><GlobeIcon/></span>
                    {idioma()}
                </div>

                <button onClick={toggleTheme} class="bg-transparent border border-border rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-foreground hover:bg-foreground/5 transition-colors">
                    {theme() === "dark" ? <SunIcon/> : <MoonIcon/>}
                </button>

                <Button variant="primary" onClick={toggleRole} class="bg-cliente text-foreground rounded-full px-5 py-2 flex gap-2 items-center text-sm font-semibold hover:opacity-90 transition-opacity border-none">
                    Demo: {accountRole() === "cliente" ? t().header.badgeClient : t().header.badgeProf}
                    <span class="ml-1"><ChevronDownIcon/></span>
                </Button>

                <button class="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors relative">
                    <BellIcon/>
                </button>
            </div>
        </header>
    );
}