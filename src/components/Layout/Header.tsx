import { Show } from "solid-js";
import { t } from "../../core/i18n";
import {
    accountRole,
    currentUser,
    toggleMobileSidebar,
    toggleSidebar,
} from "../../store/appState";
import { BellIcon, MenuIcon } from "../Icons/Icons";
import { Badge } from "../Widgets/Badge";
import { LanguageSwitcher } from "../Widgets/LanguageSwitcher";
import { ThemeSwitcher } from "../Widgets/ThemeSwitcher";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function Header() {
    const roleBadgeLabel = () => {
        const firstName =
            currentUser()?.name?.split(" ")[0] || t().header.visitor;
        const role = accountRole();
        const roleText =
            role === "estabelecimento"
                ? t().header.badgeManager
                : role === "profissional"
                  ? t().header.badgeProf
                  : t().header.badgeClient;
        return `${roleText} · ${firstName}`;
    };

    const handleMenuToggle = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            toggleMobileSidebar();
        } else {
            toggleSidebar();
        }
    };

    return (
        <header class="flex h-16 sm:h-18 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div class="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    aria-label={t().header.menuAria}
                    title={t().header.menuAria}
                    onClick={handleMenuToggle}
                    class="cursor-pointer rounded-lg border-none bg-transparent p-2 text-foreground transition-colors hover:bg-secondary"
                >
                    <MenuIcon />
                </button>

                <div class="flex min-w-0 flex-col justify-center">
                    <span class="hidden sm:inline truncate text-sm font-bold leading-tight text-foreground">
                        {t().header.home}
                    </span>
                    <div class="sm:mt-0.5">
                        <Badge variant="success">{roleBadgeLabel()}</Badge>
                    </div>
                </div>
            </div>

            <div class="flex shrink-0 items-center gap-2 sm:gap-3">
                <LanguageSwitcher />
                <ThemeSwitcher showLabel />

                <Show when={(currentUser()?.roles?.length || 0) > 0}>
                    <div class="hidden lg:block min-w-[190px]">
                        <ProfileSwitcher variant="header" />
                    </div>
                </Show>

                <button
                    type="button"
                    aria-label={t().header.notificationsAria}
                    title={t().header.notificationsAria}
                    class="relative hidden sm:inline-flex cursor-pointer items-center justify-center rounded-lg border-none bg-transparent p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                    <BellIcon />
                </button>
            </div>
        </header>
    );
}