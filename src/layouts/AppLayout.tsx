import { RouteSectionProps } from "@solidjs/router";
import { Header } from "../components/Layout/Header";
import { ProtectedRoute } from "../components/Layout/ProtectedRoute";
import { Sidebar } from "../components/Layout/Sidebar";
import { ToastContainer } from "../components/Widgets/Toast";

export default function AppLayout(props: RouteSectionProps) {
    return (
        <div class="flex h-dvh w-full overflow-hidden bg-background font-sans text-foreground">
            <Sidebar />

            <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header />
                <main class="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8 transition-colors duration-200">
                    <ProtectedRoute>{props.children}</ProtectedRoute>
                </main>
            </div>

            <ToastContainer />
        </div>
    );
}