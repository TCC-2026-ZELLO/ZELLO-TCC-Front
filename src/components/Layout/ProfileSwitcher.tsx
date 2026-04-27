import { Show, For } from "solid-js";
import { Dropdown } from "~/components/Widgets/Dropdown";
import { Avatar } from "~/components/Widgets/Avatar";
import {
    accountRole,
    currentUser,
    setAccountRole,
    managedBusinesses,
    activeBusiness,
    setActiveBusiness
} from "~/store/appState";

interface ProfileSwitcherProps {
    variant: "sidebar" | "header";
    isCollapsed?: boolean;
}

export function ProfileSwitcher(props: ProfileSwitcherProps) {

    const profileOptions = () => {
        const user = currentUser();
        if (!user) return [];

        let options: any[] = [];

        if (user.roles.includes("client")) {
            options.push({
                id: "client",
                roleType: "cliente",
                name: user.name,
                label: "Cliente",
                colorClass: "bg-cliente"
            });
        }

        if (user.roles.includes("professional")) {
            options.push({
                id: "professional",
                roleType: "profissional",
                name: user.name,
                label: "Profissional",
                colorClass: "bg-profissional"
            });
        }

        if (user.roles.includes("manager")) {
            const businesses = managedBusinesses();

            if (businesses.length > 0) {
                businesses.forEach(biz => {
                    options.push({
                        id: `manager-${biz.businessId}`,
                        roleType: "estabelecimento",
                        name: biz.name,
                        label: "Gestor",
                        colorClass: "bg-gestor",
                        businessContext: biz
                    });
                });
            } else {
                options.push({
                    id: "manager-empty",
                    roleType: "estabelecimento",
                    name: "Nenhum estabelecimento",
                    label: "Gestor",
                    colorClass: "bg-gestor"
                });
            }
        }

        return options;
    };

    const activeProfile = () => {
        const currentRole = accountRole();
        const options = profileOptions();

        if (currentRole === "estabelecimento") {
            const targetId = activeBusiness()?.businessId;
            const match = options.find(p => p.id === `manager-${targetId}`);
            if (match) return match;

            const firstManager = options.find(p => p.roleType === "estabelecimento");
            if (firstManager) return firstManager;
        }

        return options.find(p => p.roleType === currentRole) || options[0];
    };

    const getInitials = (name: string) => {
        const parts = name?.trim().split(" ") || ["U"];
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const isSidebar = () => props.variant === "sidebar";

    const handleSwitch = (profile: any, closeFn: Function) => {
        setAccountRole(profile.roleType);
        if (profile.roleType === "estabelecimento" && profile.businessContext) {
            setActiveBusiness(profile.businessContext);
        }
        closeFn();
    };

    return (
        <Show when={profileOptions().length > 0}>
            <Show
                when={!props.isCollapsed}
                fallback={
                    <div class="flex justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-white">
                        <Avatar size="md" fallbackInitials={getInitials(activeProfile()?.name || "User")}/>
                    </div>
                }
            >
                <Dropdown
                    align={isSidebar() ? "left" : "right"}
                    contentClass={isSidebar() ? "bg-[#1E3250] border border-white/10" : "bg-card border border-border"}
                    trigger={(isOpen) => (
                        <div
                            class="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors"
                            classList={{
                                "bg-white/5 hover:bg-white/10 text-white": isSidebar(),
                                "bg-card hover:bg-muted text-foreground border border-border shadow-sm": !isSidebar()
                            }}
                        >
                            <Avatar size="md" fallbackInitials={getInitials(activeProfile()?.name || "User")}/>

                            <div class="flex-1 overflow-hidden whitespace-nowrap">
                                <div class="font-semibold text-sm truncate">{activeProfile()?.name}</div>
                                <div class="text-xs truncate" classList={{"text-gray-400": isSidebar(), "text-muted-foreground": !isSidebar()}}>
                                    {activeProfile()?.label}
                                </div>
                            </div>

                            <svg
                                class={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                classList={{"text-gray-400": isSidebar(), "text-muted-foreground": !isSidebar()}}
                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    )}
                >
                    {(close) => (
                        <div class="py-1">
                            <div
                                class="px-4 py-2 text-[10px] font-bold uppercase mb-1 border-b"
                                classList={{
                                    "opacity-50 text-white border-white/10": isSidebar(),
                                    "text-muted-foreground border-border": !isSidebar()
                                }}
                            >
                                Meus Perfis
                            </div>
                            <For each={profileOptions()}>
                                {(profile) => {
                                    const isSelected = accountRole() === profile.roleType &&
                                        (profile.roleType !== "estabelecimento" || activeBusiness()?.businessId === profile.businessContext?.businessId);

                                    return (
                                        <div
                                            onClick={() => handleSwitch(profile, close)}
                                            class="px-4 py-3 cursor-pointer transition-colors flex items-center gap-3"
                                            classList={{
                                                "hover:bg-white/10 text-white": isSidebar(),
                                                "bg-white/5": isSidebar() && isSelected,
                                                "hover:bg-muted text-foreground": !isSidebar(),
                                                "bg-muted/50": !isSidebar() && isSelected,
                                            }}
                                        >
                                            <div class={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${profile.colorClass}`}>
                                                {getInitials(profile.name)}
                                            </div>
                                            <div>
                                                <div class="text-sm font-medium">{profile.name}</div>
                                                <div class="text-xs" classList={{ "text-gray-400": isSidebar(), "text-muted-foreground": !isSidebar() }}>
                                                    {profile.label}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                    )}
                </Dropdown>
            </Show>
        </Show>
    );
}