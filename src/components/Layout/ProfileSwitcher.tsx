import { useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { AccountRole, BusinessContext } from "../../core/domain/entities/models";
import { RoleAccessPolicy } from "../../core/domain/policies/RoleAccessPolicy";
import { t } from "../../core/i18n";
import {
    accountRole,
    activeBusiness,
    closeMobileSidebar,
    currentUser,
    managedBusinesses,
    switchActiveBusiness,
    switchProfileRole,
} from "../../store/appState";
import { Avatar } from "../Widgets/Avatar";
import { Dropdown } from "../Widgets/Dropdown";

interface ProfileSwitcherProps {
    variant: "sidebar" | "header";
    isCollapsed?: boolean;
}

interface ProfileOption {
    id: string;
    roleType: AccountRole;
    name: string;
    label: string;
    colorClass: string;
    businessContext?: BusinessContext;
}

export function ProfileSwitcher(props: ProfileSwitcherProps) {
    const navigate = useNavigate();

    const profileOptions = (): ProfileOption[] => {
        const user = currentUser();
        if (!user) return [];

        const options: ProfileOption[] = [
            {
                id: "client",
                roleType: "cliente",
                name: user.name,
                label: t().profileSwitcher.client,
                colorClass: "bg-cliente",
            },
        ];

        if (user.roles.includes("professional")) {
            options.push({
                id: "professional",
                roleType: "profissional",
                name: user.name,
                label: t().profileSwitcher.professional,
                colorClass: "bg-profissional",
            });
        }

        if (user.roles.includes("manager")) {
            const businesses = managedBusinesses();
            if (businesses.length > 0) {
                for (const biz of businesses) {
                    options.push({
                        id: `manager-${biz.businessId}`,
                        roleType: "estabelecimento",
                        name: biz.name,
                        label: t().profileSwitcher.manager,
                        colorClass: "bg-gestor",
                        businessContext: biz,
                    });
                }
            } else {
                options.push({
                    id: "manager-empty",
                    roleType: "estabelecimento",
                    name: t().profileSwitcher.noBusiness,
                    label: t().profileSwitcher.manager,
                    colorClass: "bg-gestor",
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
            const match = options.find((p) => p.id === `manager-${targetId}`);
            if (match) return match;

            const firstManager = options.find((p) => p.roleType === "estabelecimento");
            if (firstManager) return firstManager;
        }

        return options.find((p) => p.roleType === currentRole) || options[0];
    };

    const getInitials = (name: string) => {
        const parts = name?.trim().split(" ") || ["U"];
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    const isSidebar = () => props.variant === "sidebar";

    const handleSwitch = (profile: ProfileOption, closeFn: () => void) => {
        const previousRole = accountRole();
        if (profile.roleType === "estabelecimento" && profile.businessContext) {
            switchActiveBusiness(profile.businessContext);
        } else {
            switchProfileRole(profile.roleType);
        }
        closeFn();
        closeMobileSidebar();
        if (previousRole !== profile.roleType) {
            navigate(RoleAccessPolicy.getDescriptor(profile.roleType).defaultRoute);
        }
    };

    return (
        <Show when={profileOptions().length > 0}>
            <Dropdown
                align={isSidebar() ? "left" : "right"}
                contentClass="bg-card border border-border text-foreground shadow-xl min-w-[220px]"
                trigger={(isOpen) => (
                    <div
                        class={`flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors ${
                            props.isCollapsed ? "md:justify-center" : ""
                        } ${
                            isSidebar()
                                ? "bg-white/8 text-sidebar-foreground hover:bg-white/15"
                                : "border border-border bg-card text-foreground shadow-sm hover:bg-muted"
                        }`}
                    >
                        <Avatar
                            size="md"
                            fallbackInitials={getInitials(
                                activeProfile()?.name || "User",
                            )}
                        />

                        <div
                            class={`flex-1 overflow-hidden whitespace-nowrap ${
                                props.isCollapsed ? "md:hidden" : ""
                            }`}
                        >
                            <div class="truncate text-sm font-semibold">
                                {activeProfile()?.name}
                            </div>
                            <div
                                class={`truncate text-xs ${
                                    isSidebar()
                                        ? "text-sidebar-foreground/70"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {activeProfile()?.label}
                            </div>
                        </div>

                        <svg
                            class={`shrink-0 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                            } ${props.isCollapsed ? "md:hidden" : ""} ${
                                isSidebar()
                                    ? "text-sidebar-foreground/70"
                                    : "text-muted-foreground"
                            }`}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                )}
            >
                {(close) => (
                    <div class="py-1">
                        <div class="mb-1 border-b border-border px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">
                            {t().profileSwitcher.title}
                        </div>
                        <For each={profileOptions()}>
                            {(profile) => {
                                const isSelected = () =>
                                    accountRole() === profile.roleType &&
                                    (profile.roleType !== "estabelecimento" ||
                                        activeBusiness()?.businessId ===
                                            profile.businessContext?.businessId);

                                return (
                                    <button
                                        type="button"
                                        onClick={() => handleSwitch(profile, close)}
                                        class={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted ${
                                            isSelected() ? "bg-muted/60" : ""
                                        }`}
                                    >
                                        <div
                                            class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${profile.colorClass}`}
                                        >
                                            {getInitials(profile.name)}
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <div class="truncate text-sm font-medium text-foreground">
                                                {profile.name}
                                            </div>
                                            <div class="truncate text-xs text-muted-foreground">
                                                {profile.label}
                                            </div>
                                        </div>
                                    </button>
                                );
                            }}
                        </For>
                    </div>
                )}
            </Dropdown>
        </Show>
    );
}
