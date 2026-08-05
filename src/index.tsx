import './index.css';
import 'solid-devtools';

import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { initializeStore } from "./store/appState";

const root = document.getElementById('root');

initializeStore();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// 2. Auth & Independent Routes (Outside the app layout)
import Login from "./pages/login";
import PasswordRecovery from "./pages/passwordRecovery";
import RedefinirSenha from "./pages/redefinir-senha";
import Register from "./pages/register";

// 3. Layout & Static Pages
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Agendamentos from "./pages/agendamentos";
import BusinessSettings from "./pages/business_settings";
import Catalog from "./pages/catalog";
import Configuracoes from "./pages/configuracoes";
import Explore from "./pages/explore";
import ProfessionalSettings from "./pages/professional_settings";
import Professionals from "./pages/professionals";
import TeamSchedule from "./pages/team_schedule";

// 4. Dynamic Pages
import BusinessProfile from "./pages/BusinessProfile";
import PublicProfile from "./pages/PublicProfile";

// 5. Catch-all / 404
import NotFound from "./pages/NotFound";

render(
    () => (
        <Router>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          <Route path="/passwordRecovery" component={PasswordRecovery} />
          <Route path="/redefinir-senha" component={RedefinirSenha} />
          <Route path="/register" component={Register} />

          {/* Pathless Route (Layout Group) */}
          <Route component={AppLayout}>
            <Route path="/home" component={Home} />
            <Route path="/agendamentos" component={Agendamentos} />
            <Route path="/business_settings" component={BusinessSettings} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/configuracoes" component={Configuracoes} />
            <Route path="/explore" component={Explore} />
            <Route path="/professional_settings" component={ProfessionalSettings} />
            <Route path="/professionals" component={Professionals} />
            <Route path="/team_schedule" component={TeamSchedule} />

            {/* Dynamic Routes */}
            <Route path="/business_profile/:id" component={BusinessProfile} />
            <Route path="/public_profile/:id" component={PublicProfile} />

            {/* Catch-all Route for 404s */}
            <Route path="*404" component={NotFound} />
          </Route>
        </Router>
    ),
    root!
);