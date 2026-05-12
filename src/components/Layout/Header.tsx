import { Show } from "solid-js";
import { Badge } from "~/components/Widgets/Badge";
import { ProfileSwitcher } from "~/components/Layout/ProfileSwitcher";

import { accountRole, idioma, theme, toggleTheme, t, toggleSidebar, currentUser } from "~/store/appState";
import { MenuIcon, GlobeIcon, SunIcon, MoonIcon, BellIcon } from "~/components/Icons/Icons";

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
                        <Badge variant={"success"}>
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

                {/* Dropdown de Perfil do Header (Substituiu o antigo botão de toggleRole) */}
                <Show when={(currentUser()?.roles?.length || 0) > 0}>
                    <div class="hidden sm:block min-w-[200px]"> {/* Container para evitar quebra em telas menores */}
                        <ProfileSwitcher variant="header" />
                    </div>
                </Show>

                <button class="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors relative">
                    <BellIcon/>
                </button>
            </div>
        </header>
    );
}