import { JSX, createSignal, onMount, Show, createMemo } from "solid-js";
import { Navigate, useLocation } from "@solidjs/router";
import {
  accountRole,
  isAuthenticated,
  API,
  currentUser,
  isMounted,
  setAccessToken,
  setCurrentUser,
  setAccountRole
} from "~/store/appState";
import { loadUserContext } from "~/services/auth.service";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: Array<"cliente" | "profissional" | "estabelecimento">;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
  const location = useLocation();

  const [isVerifying, setIsVerifying] = createSignal(true);

  onMount(async () => {
    if (isAuthenticated()) {
      const user = currentUser();
      if (user) await loadUserContext(user);
      setIsVerifying(false);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();

        setCurrentUser(data.user);
        setAccessToken("session-cookie-active");

        const role = data.user.roles.includes("manager") ? "estabelecimento" :
            data.user.roles.includes("professional") ? "profissional" : "cliente";
        setAccountRole(role);

        await loadUserContext(data.user);
      }
    } catch (e) {
      console.error("[Auth Guard] Session verification failed");
    } finally {
      setIsVerifying(false);
    }
  });

  const canAccess = createMemo(() => {
    if (!isAuthenticated()) return false;

    if (props.allowedRoles && !props.allowedRoles.includes(accountRole())) {
      return false;
    }

    return true;
  });

  return (
      <Show
          when={isMounted() && !isVerifying()}
          fallback={
            <div class="flex h-screen w-full items-center justify-center bg-background">
              <div class="flex flex-col items-center gap-4">
                {/* Replace with your actual loading spinner/logo */}
                <div class="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p class="text-sm text-muted-foreground animate-pulse">Verificando acesso...</p>
              </div>
            </div>
          }
      >
        <Show
            when={canAccess()}
            fallback={
              <Show
                  when={isAuthenticated()}
                  fallback={<Navigate href={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`} />}
              >
                {/* If authenticated but role is wrong, go to explore */}
                <Navigate href="/explore" />
              </Show>
            }
        >
          {props.children}
        </Show>
      </Show>
  );
}