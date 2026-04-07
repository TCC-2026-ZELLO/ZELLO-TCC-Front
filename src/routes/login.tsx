import { createSignal } from "solid-js";
import { Card } from "../components/Widgets/Card/Card";
import { Input } from "../components/Widgets/Input/Input";
import { Button } from "../components/Widgets/Button/Button";
import {
  ZelloIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  GoogleIcon,
} from "../components/Icons/Icons";
import { theme, toggleTheme } from "../store/appState";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <main class="login-main">
      <div class="login-layout">
        <div class="login-left-panel">
          <div class="login-bg-circles">
            <div class="login-circle-top" />
            <div class="login-circle-bottom" />
          </div>

          <div class="login-left-content">
            <div class="login-logo">{ZelloIcon}</div>

            <h1 class="login-welcome-title">Bem-vindo ao Zello</h1>
            <p class="login-welcome-text">
              A plataforma premium que conecta você aos melhores profissionais
              de beleza e estética da sua cidade.
            </p>

            <div class="login-stats-container">
              <div class="login-stat-card">
                <div class="login-stat-value">2.400+</div>
                <div class="login-stat-label">Profissionais</div>
              </div>
              <div class="login-stat-card">
                <div class="login-stat-value">18k+</div>
                <div class="login-stat-label">Clientes</div>
              </div>
              <div class="login-stat-card">
                <div class="login-stat-value">4.9 ★</div>
                <div class="login-stat-label">Avaliação</div>
              </div>
            </div>
          </div>
        </div>

        <div class="login-right-panel">
          <div class="login-top-actions">
            <button class="login-action-btn">
              {GlobeIcon}
              <span>PT</span>
            </button>
            <button
              class="login-action-btn icon-only"
              onClick={toggleTheme}
              title={
                theme() === "dark"
                  ? "Mudar para Light Mode"
                  : "Mudar para Dark Mode"
              }
            >
              {theme() === "dark" ? SunIcon : MoonIcon}
            </button>
          </div>

          <div class="login-form-container">
            <div class="login-header">
              <h1 class="login-title">Entrar na sua conta</h1>
              <p class="login-subtitle">
                Acesse com suas credenciais para continuar
              </p>
            </div>

            <form class="login-form" onSubmit={handleSubmit}>
              <Input
                labelText="E-mail"
                placeholder="seu@email.com"
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
              />

              <div class="login-password-wrapper">
                <a href="#" class="login-forgot-password">
                  Esqueceu a senha?
                </a>
                <Input
                  labelText="Senha"
                  placeholder="••••••••"
                  type="password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                />
              </div>

              {errorMessage() && <p class="login-error">{errorMessage()}</p>}

              <Button type="submit" variant="primary" class="login-submit-btn">
                {loading() ? "Carregando..." : "Entrar →"}
              </Button>
            </form>

            <div class="login-divider">
              <div class="login-divider-line" />
              ou continue com
              <div class="login-divider-line" />
            </div>

            <Button variant="outline" class="login-google-btn">
              {GoogleIcon}
              Entrar com Google
            </Button>

            <div class="login-signup-container">
              Não tem uma conta?{" "}
              <a href="#" class="login-signup-link">
                Cadastre-se grátis
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
