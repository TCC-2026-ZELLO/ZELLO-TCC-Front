import { JSX, Show } from "solid-js";
import { Sidebar } from "~/components/Layout/Sidebar";
import { Header } from "~/components/Layout/Header";
import { HelpIcon } from "~/components/Icons/Icons";
import { RouteSectionProps, useLocation } from "@solidjs/router";
import { ProtectedRoute } from "~/components/Layout/ProtectedRoute";
import { ToastContainer } from "~/components/Widgets/Toast";
import { isAuthenticated, isMounted } from "~/store/appState";
import { PublicHeader } from "~/components/LandingPage/Navbar";

export default function AppLayout(props: RouteSectionProps) {
    const location = useLocation();

    // Rotas que PODEM ser acessadas sem login (Catálogo e Perfis)
    const isPublicRoute = () => {
        const path = location.pathname;
        return path.startsWith("/explore") ||
               path.startsWith("/public_profile") ||
               path.startsWith("/business_profile");
    };

    return (
        <Show when={isMounted()}>
            <Show when={isAuthenticated()} fallback={
                <Show when={isPublicRoute()} fallback={<ProtectedRoute>{props.children}</ProtectedRoute>}>
                    {/* Layout Público para Rotas de Catálogo quando Deslogado */}
                    <div style={{ display: "flex", "flex-direction": "column", "min-height": "100vh", "background-color": "var(--color-background)", color: "var(--color-foreground)", "font-family": "var(--font-family)" }}>
                        <PublicHeader />
                        <main style={{ flex: 1, display: "flex", "flex-direction": "column", "padding-top": "80px" }}>
                            {props.children}
                        </main>
                        <ToastContainer />
                    </div>
                </Show>
            }>
                {/* Layout Logado (Dashboard) */}
                <div style={{ display: "flex", height: "100vh", "background-color": "var(--color-background)", color: "var(--color-foreground)", "font-family": "var(--font-family)" }}>
                    <Sidebar />
                    <div style={{ flex: 1, display: "flex", "flex-direction": "column", overflow: "hidden" }}>
                        <Header />
                        <main style={{ flex: 1, "overflow-y": "auto", padding: "var(--space-10)", "background-color": "var(--color-background)", transition: "all 0.2s ease" }}>
                            {props.children}
                        </main>
                    </div>
                    <ToastContainer />
                </div>
            </Show>
        </Show>
    );
}