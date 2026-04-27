import { JSX } from "solid-js";
import { Sidebar } from "~/components/Layout/Sidebar";
import { Header } from "~/components/Layout/Header";
import { HelpIcon } from "~/components/Icons/Icons";
import {RouteSectionProps} from "@solidjs/router";
import { ProtectedRoute } from "~/components/Layout/ProtectedRoute";

export default function AppLayout(props: RouteSectionProps) {
    return (
        <div style={{ display: "flex", height: "100vh", "background-color": "var(--color-background)", color: "var(--color-foreground)", "font-family": "var(--font-family)" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", "flex-direction": "column" }}>
                <Header />
                <main style={{ flex: 1, "overflow-y": "auto", padding: "var(--space-10)", "background-color": "var(--color-background)", transition: "all 0.2s ease" }}>
                    <ProtectedRoute>
                        {props.children}
                    </ProtectedRoute>
                </main>
            </div>
        </div>
    );
}