import { createSignal, For, Show } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
import {
  accountRole,
  idioma,
  setIdioma,
  theme,
  toggleTheme,
  t,
  API,
  accessToken,
  currentUser,
  setCurrentUser,
} from "~/store/appState";
import { Language } from "~/store/translations";
import {
  CameraIcon,
  SaveIcon,
  GlobeIcon,
  SunIcon,
  LockIcon,
  BriefcaseIcon,
  ImageIcon,
} from "~/components/Icons/Icons";

export default function Settings() {
  // Sinais de estado dos formulários
  const [novaSenha, setNovaSenha] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [visibilityStatus, setVisibilityStatus] = createSignal(false); // Adicionado para bater com seu DTO

  // Sinais de Loading e Feedback visual
  const [loadingPro, setLoadingPro] = createSignal(false);
  const [feedbackPro, setFeedbackPro] = createSignal({ type: "", message: "" });

  // Sinais para atualizar Dados Básicos
  const [nomeBase, setNomeBase] = createSignal("");
  const [loadingBasic, setLoadingBasic] = createSignal(false);
  const [feedbackBasic, setFeedbackBasic] = createSignal({
    type: "",
    message: "",
  });

  const errors = {
    PT: {
      reqName: "O nome é obrigatório.",
      reqPhone: "Telefone incompleto.",
      reqEmail: "O e-mail é obrigatório.",
      invalidEmail: "E-mail inválido.",
      reqCity: "A cidade é obrigatória.",
      reqCurrentPass: "A senha atual é obrigatória.",
      minPass: "Mínimo de 6 caracteres.",
      passMismatch: "As senhas não coincidem.",
      reqBio: "A biografia é obrigatória para profissionais.",
    },
    EN: {
      reqName: "Name is required.",
      reqPhone: "Incomplete phone.",
      reqEmail: "Email is required.",
      invalidEmail: "Invalid email.",
      reqCity: "City is required.",
      reqCurrentPass: "Current password is required.",
      minPass: "Minimum of 6 characters.",
      passMismatch: "Passwords do not match.",
      reqBio: "Biography is required for professionals.",
    },
  };
  const err = () => errors[idioma()];

  const handleSaveBasicData = async () => {
    const user = currentUser();
    const trimmedName = nomeBase().trim();
    if (!user || trimmedName === "") return;

    setLoadingBasic(true);
    setFeedbackBasic({ type: "", message: "" });

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nome: trimmedName || user.name,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao salvar perfil.");
      }
      const updatedUser = await res.json();

      // O backend mapeia updateUserDto.nome para User.name internamente,
      // então a resposta (updatedUser) já volta com a chave .name preenchida corretamente!
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFeedbackBasic({ type: "success", message: "Dados atualizados!" });
      setTimeout(() => setFeedbackBasic({ type: "", message: "" }), 3000);
    } catch (error: any) {
      setFeedbackBasic({ type: "error", message: error.message });
    } finally {
      setLoadingBasic(false);
    }
  };

  // ─── CONEXÃO COM O BACKEND (RF7: Atualizar Perfil Profissional) ─────────
  const handleSaveProfessionalProfile = async () => {
    setFeedbackPro({ type: "", message: "" });
    setLoadingPro(true);

    try {
      const response = await fetch(`${API}/professionals/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Envia o token JWT para passar pelo JwtAuthGuard
          Authorization: `Bearer ${accessToken()}`,
        },
        body: JSON.stringify({
          bio: bio(),
          visibilityStatus: visibilityStatus(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar perfil.");
      }

      setFeedbackPro({
        type: "success",
        message: "Vitrine atualizada com sucesso!",
      });

      // Remove a mensagem de sucesso após 3 segundos
      setTimeout(() => setFeedbackPro({ type: "", message: "" }), 3000);
    } catch (error: any) {
      setFeedbackPro({ type: "error", message: error.message });
    } finally {
      setLoadingPro(false);
    }
  };

  return (
    <div class="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-8 pb-20 md:py-12">
      <header class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-foreground">{t().settings.title}</h1>
        <p class="text-muted-foreground">
          {accountRole() === "cliente"
            ? t().sidebar.clientName
            : "Painel do Profissional / Gestor"}
        </p>
      </header>

      {/* SEÇÃO COMUM: DADOS BÁSICOS */}
      <section class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold text-foreground">
          {t().settings.profile.title}
        </h2>

        <Card class="flex flex-col gap-8 p-6 md:p-8">
          <div class="flex items-center gap-6">
            <div class="relative">
              <img
                src="https://i.pravatar.cc/150?img=47"
                alt="Profile"
                class="size-20 rounded-xl object-cover"
              />
              <button
                type="button"
                class="absolute -bottom-2 -right-2 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <CameraIcon />
              </button>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-sm font-semibold text-foreground">
                {t().settings.profile.photo}
              </span>
              <button
                type="button"
                class="text-left text-sm font-medium text-primary hover:underline"
              >
                {t().settings.profile.changePhoto}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              labelText={t().settings.profile.nameLabel}
              value={nomeBase() || currentUser()?.name || ""}
              onInput={(e) => setNomeBase(e.currentTarget.value)}
              placeholder="Ana Clara Matos"
              type="text"
            />
            <Input
              labelText={t().settings.profile.phoneLabel}
              placeholder="(41) 9 9812-2234"
              type="tel"
            />
            <Input
              labelText={t().settings.profile.emailLabel}
              value={currentUser()?.email || ""}
              placeholder="ana@email.com"
              type="email"
              disabled
            />
            <Input
              labelText={t().settings.profile.cityLabel}
              placeholder="Curitiba - PR"
              type="text"
            />
          </div>

          <Show when={feedbackBasic().message}>
            <div
              class={`rounded-lg px-4 py-3 text-sm font-medium ${feedbackBasic().type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
            >
              {feedbackBasic().message}
            </div>
          </Show>

          <Show when={accountRole() === "cliente"}>
            <div class="pt-2">
              <Button
                variant="primary"
                onClick={handleSaveBasicData}
                disabled={loadingBasic()}
              >
                <SaveIcon />{" "}
                {loadingBasic() ? "Salvando..." : t().settings.profile.saveBtn}
              </Button>
            </div>
          </Show>
        </Card>
      </section>

      {/* SEÇÃO EXCLUSIVA: PROFISSIONAL (RF7, RF8, RF9) */}
      <Show when={accountRole() === "profissional"}>
        <section class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 class="text-lg font-semibold text-foreground">
            Perfil Profissional (Vitrine)
          </h2>

          <Card class="flex flex-col gap-8 p-6 md:p-8">
            <div class="flex items-center justify-between border-b border-border pb-6">
              <div class="flex flex-col">
                <span class="font-medium text-foreground">Perfil Público</span>
                <span class="text-sm text-muted-foreground">
                  Permitir que clientes encontrem sua vitrine nas buscas.
                </span>
              </div>
              <Switch
                checked={visibilityStatus()}
                onChange={(e) => setVisibilityStatus(e.currentTarget.checked)}
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-foreground">
                Biografia Profissional
              </label>
              <textarea
                class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px] resize-y"
                placeholder="Conte sobre sua especialidade, tempo de experiência..."
                value={bio()}
                onInput={(e) => setBio(e.currentTarget.value)}
                disabled={loadingPro()}
              />
            </div>

            <div class="flex flex-col gap-2 border-t border-border pt-6">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-foreground">
                  Galeria de Portfólio
                </span>
                <span class="text-xs text-muted-foreground">0/10 imagens</span>
              </div>
              <div class="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                <div class="flex flex-col items-center gap-2">
                  <ImageIcon />
                  <span class="text-sm">Clique para fazer upload de fotos</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 border-t border-border pt-6">
              <span class="text-sm font-medium text-foreground">
                Certificados e Qualificações
              </span>
              <div class="flex items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                <span class="text-sm">Adicionar diploma ou especialização</span>
              </div>
            </div>

            <Show when={feedbackPro().message}>
              <div
                class={`rounded-lg px-4 py-3 text-sm font-medium ${feedbackPro().type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
              >
                {feedbackPro().message}
              </div>
            </Show>

            <div class="pt-2">
              <Button
                variant="primary"
                onClick={handleSaveProfessionalProfile}
                disabled={loadingPro()}
              >
                <BriefcaseIcon />{" "}
                {loadingPro() ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </Card>
        </section>
      </Show>

      <section class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold text-foreground">
          {t().settings.security.title}
        </h2>

        <Card class="flex flex-col gap-8 p-6 md:p-8">
          <div>
            <Input
              labelText={t().settings.security.currentPassword}
              type="password"
              placeholder="••••••••"
              validate={(val) => (!val ? err().reqCurrentPass : null)}
            />
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              labelText={t().settings.security.newPassword}
              type="password"
              onInput={(e) => setNovaSenha(e.currentTarget.value)}
              validate={(val) =>
                val.length > 0 && val.length < 6 ? err().minPass : null
              }
            />
            <Input
              labelText={t().settings.security.confirmPassword}
              type="password"
              validate={(val) =>
                (val || novaSenha()) && val !== novaSenha()
                  ? err().passMismatch
                  : null
              }
            />
          </div>

          <div class="pt-2">
            <Button variant="primary">
              <LockIcon /> {t().settings.security.changePasswordBtn}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
