import "./index.css";
import "solid-devtools";

import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Agendamentos from "./pages/agendamentos";
import BusinessSettings from "./pages/business_settings";
import BusinessProfile from "./pages/BusinessProfile";
import Catalog from "./pages/catalog";
import Configuracoes from "./pages/configuracoes";
import Explore from "./pages/explore";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import LocationSearch from "./pages/LocationSearch";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import PasswordRecovery from "./pages/passwordRecovery";
import ProfessionalSettings from "./pages/professional_settings";
import Professionals from "./pages/professionals";
import PublicProfile from "./pages/PublicProfile";
import RedefinirSenha from "./pages/redefinir-senha";
import Register from "./pages/register";
import TeamSchedule from "./pages/team_schedule";
import { initializeStore } from "./store/appState";

const root = document.getElementById("root");

initializeStore();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
    );
}

const GuardedProfessionalSettings = () => (
    <ProtectedRoute allowedRoles={["profissional"]}>
        <ProfessionalSettings />
    </ProtectedRoute>
);

const GuardedTeamSchedule = () => (
    <ProtectedRoute allowedRoles={["estabelecimento"]}>
        <TeamSchedule />
    </ProtectedRoute>
);

const GuardedCatalog = () => (
    <ProtectedRoute allowedRoles={["estabelecimento"]}>
        <Catalog />
    </ProtectedRoute>
);

const GuardedProfessionals = () => (
    <ProtectedRoute allowedRoles={["estabelecimento"]}>
        <Professionals />
    </ProtectedRoute>
);

const GuardedBusinessSettings = () => (
    <ProtectedRoute allowedRoles={["estabelecimento"]}>
        <BusinessSettings />
    </ProtectedRoute>
);

render(
    () => (
        <Router>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/passwordRecovery" component={PasswordRecovery} />
            <Route path="/redefinir-senha" component={RedefinirSenha} />
            <Route path="/register" component={Register} />

            <Route component={AppLayout}>
                <Route path="/home" component={Home} />
                <Route path="/agendamentos" component={Agendamentos} />
                <Route path="/explore" component={Explore} />
                <Route path="/mapa" component={LocationSearch} />
                <Route path="/configuracoes" component={Configuracoes} />

                <Route path="/professional_settings" component={GuardedProfessionalSettings} />
                <Route path="/team_schedule" component={GuardedTeamSchedule} />
                <Route path="/catalog" component={GuardedCatalog} />
                <Route path="/professionals" component={GuardedProfessionals} />
                <Route path="/business_settings" component={GuardedBusinessSettings} />

                <Route path="/business_profile/:id" component={BusinessProfile} />
                <Route path="/public_profile/:id" component={PublicProfile} />

                <Route path="*404" component={NotFound} />
            </Route>
        </Router>
    ),
    root!,
);