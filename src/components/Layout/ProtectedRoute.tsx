import { JSX, createSignal, onMount, Show } from "solid-js";
import { Navigate, useLocation } from "@solidjs/router";
import { accountRole, isAuthenticated, API } from "~/store/appState";
import { loginAuth } from "~/services/auth.service";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: Array<"cliente" | "profissional" | "estabelecimento">;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = createSignal(true);
  const [sessionValid, setSessionValid] = createSignal(false);

  onMount(async () => {
    // Se o state local diz que estamos logados, confia
    if (isAuthenticated()) {
      setSessionValid(true);
      setIsCheckingSession(false);
      return;
    }

    // Se não, tenta recuperar via cookie no backend
    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        // Sincroniza o usuário no local storage/state
        loginAuth(data.user);
        setSessionValid(true);
      }
    } catch (e) {
       // Falha silenciosa, redirecionará pro login a seguir
    } finally {
      setIsCheckingSession(false);
    }
  });

  return (
    <Show when={!isCheckingSession()} fallback={<div class="p-8 text-center text-muted-foreground">Carregando sessão...</div>}>
      <Show when={sessionValid()} fallback={<Navigate href={`/login?redirect=${location.pathname}`} />}>
        <Show 
            when={!props.allowedRoles || props.allowedRoles.includes(accountRole())} 
            fallback={<Navigate href="/explore" />}
        >
            {props.children}
        </Show>
      </Show>
    </Show>
  );
}
