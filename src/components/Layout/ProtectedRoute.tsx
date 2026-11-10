import { Navigate, useLocation } from "@solidjs/router";
import { createMemo, createSignal, JSX, onMount, Show } from "solid-js";
import { container } from "../../core/container";
import type { AccountRole } from "../../core/domain/entities/models";
import { RoleAccessPolicy } from "../../core/domain/policies/RoleAccessPolicy";
import { t } from "../../core/i18n";
import { loadUserContext } from "../../services/auth.service";
import {
    accountRole,
    currentUser,
    isAuthenticated,
    isMounted,
    managedBusinesses,
    persistAuthSession,
} from "../../store/appState";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: readonly AccountRole[];
}

export function ProtectedRoute(props: ProtectedRouteProps) {
    const location = useLocation();
    const [isVerifying, setIsVerifying] = createSignal(true);

    onMount(async () => {
        if (isAuthenticated()) {
            const user = currentUser();
            if (user && user.roles.includes("manager") && managedBusinesses().length === 0) {
                await loadUserContext(user);
            }
            setIsVerifying(false);
            return;
        }

        try {
            const session = await container.authRepo.getCurrentSession();
            if (session?.user) {
                persistAuthSession({
                    user: session.user,
                    token: "session-cookie-active",
                    role: RoleAccessPolicy.resolvePrimaryRole(session.user.roles),
                });
                await loadUserContext(session.user);
            }
        } catch {
        } finally {
            setIsVerifying(false);
        }
    });

    const canAccess = createMemo(() => {
        if (!isAuthenticated()) return false;
        return RoleAccessPolicy.canAccess(accountRole(), props.allowedRoles);
    });

    const fallbackRoute = createMemo(
        () => RoleAccessPolicy.getDescriptor(accountRole()).defaultRoute,
    );

    return (
        <Show
            when={isMounted() && !isVerifying()}
            fallback={
                <div class="flex h-full min-h-[60vh] w-full items-center justify-center bg-background">
                    <div class="flex flex-col items-center gap-4">
                        <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p class="animate-pulse text-sm text-muted-foreground">
                            {t().common.verifyingAccess}
                        </p>
                    </div>
                </div>
            }
        >
            <Show
                when={canAccess()}
                fallback={
                    <Show
                        when={isAuthenticated()}
                        fallback={
                            <Navigate
                                href={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
                            />
                        }
                    >
                        <Navigate href={fallbackRoute()} />
                    </Show>
                }
            >
                {props.children}
            </Show>
        </Show>
    );
}