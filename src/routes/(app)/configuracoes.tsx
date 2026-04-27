import { createSignal, Show } from "solid-js";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import {
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
import {
  CameraIcon,
  SaveIcon,
  LockIcon,
  SunIcon,
  GlobeIcon,
  BriefcaseIcon,
  CheckCircleIcon, HomeIcon, EyeIcon
} from "~/components/Icons/Icons";
import { http } from "~/services/api";

export default function Settings() {
  const [nomeBase, setNomeBase] = createSignal("");
  const [loadingBasic, setLoadingBasic] = createSignal(false);
  const [feedbackBasic, setFeedbackBasic] = createSignal({ type: "", message: "" });

  const [senhaAtual, setSenhaAtual] = createSignal("");
  const [novaSenha, setNovaSenha] = createSignal("");
  const [confirmarSenha, setConfirmarSenha] = createSignal("");
  const [loadingSecurity, setLoadingSecurity] = createSignal(false);
  const [feedbackSecurity, setFeedbackSecurity] = createSignal({ type: "", message: "" });

  const [loadingProfile, setLoadingProfile] = createSignal<string | null>(null);

  const hasRole = (role: string) => currentUser()?.roles?.includes(role);

  const isStrongPassword = (v: string) => {
    return v.length >= 8 && /(?=.*\d)(?=.*\W+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(v);
  };

  const handleSaveBasicData = async () => {
    const user = currentUser();
    const newName = nomeBase() || user?.name;
    if (!user || !newName) return;

    setLoadingBasic(true);
    try {
      const response = await http.patch<any>(`/users/${user.id}`, { nome: newName });
      const updatedUser = response.data || response;
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFeedbackBasic({ type: "success", message: "Dados atualizados com sucesso!" });
      setTimeout(() => setFeedbackBasic({ type: "", message: "" }), 3000);
    } catch (error: any) {
      setFeedbackBasic({ type: "error", message: error.message || "Erro ao salvar" });
    } finally {
      setLoadingBasic(false);
    }
  };

  const handleAppendProfile = async (type: 'professional' | 'manager' | 'client') => {
    setLoadingProfile(type);
    try {
      const response = await http.post<any>(`/users/profiles/${type}`, {});
      const updatedUser = response.data || response;
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert(`Perfil de ${type === 'client' ? 'Cliente' : type === 'professional' ? 'Profissional' : 'Gestor'} ativado!`);
    } catch (error: any) {
      alert(error.message || "Erro ao ativar perfil.");
    } finally {
      setLoadingProfile(null);
    }
  };

  const handleSavePassword = async () => {
    const user = currentUser();
    if (!user || user.provider === "google") return;
    if (!senhaAtual() || novaSenha() !== confirmarSenha() || !isStrongPassword(novaSenha())) return;

    setLoadingSecurity(true);
    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken()}`,
        },
        body: JSON.stringify({ currentPassword: senhaAtual(), password: novaSenha() }),
      });
      if (!res.ok) throw new Error("Senha atual incorreta.");
      setFeedbackSecurity({ type: "success", message: "Senha alterada!" });
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      setTimeout(() => setFeedbackSecurity({ type: "", message: "" }), 3000);
    } catch (error: any) {
      setFeedbackSecurity({ type: "error", message: error.message });
    } finally {
      setLoadingSecurity(false);
    }
  };

  return (
      <Show when={currentUser()} fallback={<div class="p-20 text-center text-muted-foreground animate-pulse">Carregando configurações...</div>}>
        <div class="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-8 pb-20 md:py-12 animate-in fade-in duration-300">
          <header class="flex flex-col gap-1">
            <h1 class="text-3xl font-bold text-foreground">Configurações da Conta</h1>
            <p class="text-muted-foreground">Gerencie seus dados pessoais, perfis e preferências do sistema.</p>
          </header>

          {/* DADOS BÁSICOS */}
          <section class="flex flex-col gap-4">
            <h2 class="text-lg font-semibold text-foreground">Informações Pessoais</h2>
            <Card class="flex flex-col gap-8 p-6 md:p-8 border-border">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input labelText="Nome Completo" value={nomeBase() || currentUser()?.name || ""} onInput={(e) => setNomeBase(e.currentTarget.value)} />
                <Input labelText="E-mail" value={currentUser()?.email || ""} disabled />
              </div>

              <Show when={feedbackBasic().message}>
                <div class={`rounded-lg px-4 py-3 text-sm font-medium ${feedbackBasic().type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
                  {feedbackBasic().message}
                </div>
              </Show>

              <Button variant="primary" class="w-fit" onClick={handleSaveBasicData} disabled={loadingBasic()}>
                <SaveIcon /> {loadingBasic() ? "Salvando..." : "Salvar Informações"}
              </Button>
            </Card>
          </section>

          {/* MEUS PERFIS */}
          <section class="flex flex-col gap-4">
            <h2 class="text-lg font-semibold text-foreground">Meus Perfis</h2>
            <p class="text-sm text-muted-foreground -mt-2">Habilite novas funções para transitar entre diferentes papéis no Zello.</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card Cliente */}
              <Card class="p-6 flex flex-col justify-between gap-6 border-border">
                <div class="flex items-start gap-4">
                  <div class="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><EyeIcon size={24} /></div>
                  <div class="flex flex-col">
                    <span class="font-bold text-foreground">Sou Cliente</span>
                    <p class="text-[11px] text-muted-foreground">Agende serviços e gerencie seus compromissos.</p>
                  </div>
                </div>
                <Show when={hasRole('client')} fallback={
                  <Button variant="outline" size="sm" onClick={() => handleAppendProfile('client')} disabled={!!loadingProfile()}>
                    {loadingProfile() === 'client' ? "Ativando..." : "Ativar Perfil"}
                  </Button>
                }>
                  <div class="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full"><CheckCircleIcon size={16}/> Ativo</div>
                </Show>
              </Card>

              {/* Card Profissional */}
              <Card class="p-6 flex flex-col justify-between gap-6 border-border">
                <div class="flex items-start gap-4">
                  <div class="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><BriefcaseIcon size={24} /></div>
                  <div class="flex flex-col">
                    <span class="font-bold text-foreground">Sou Profissional</span>
                    <p class="text-[11px] text-muted-foreground">Preste serviços e gerencie sua própria agenda.</p>
                  </div>
                </div>
                <Show when={hasRole('professional')} fallback={
                  <Button variant="outline" size="sm" onClick={() => handleAppendProfile('professional')} disabled={!!loadingProfile()}>
                    {loadingProfile() === 'professional' ? "Ativando..." : "Ativar Perfil"}
                  </Button>
                }>
                  <div class="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full"><CheckCircleIcon size={16}/> Ativo</div>
                </Show>
              </Card>

              {/* Card Gestor */}
              <Card class="p-6 flex flex-col justify-between gap-6 border-border">
                <div class="flex items-start gap-4">
                  <div class="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500"><HomeIcon size={24} /></div>
                  <div class="flex flex-col">
                    <span class="font-bold text-foreground">Sou Gestor</span>
                    <p class="text-[11px] text-muted-foreground">Gerencie estabelecimentos, equipes e finanças.</p>
                  </div>
                </div>
                <Show when={hasRole('manager')} fallback={
                  <Button variant="outline" size="sm" onClick={() => handleAppendProfile('manager')} disabled={!!loadingProfile()}>
                    {loadingProfile() === 'manager' ? "Ativando..." : "Ativar Perfil"}
                  </Button>
                }>
                  <div class="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full"><CheckCircleIcon size={16}/> Ativo</div>
                </Show>
              </Card>
            </div>
          </section>

          {/* PREFERÊNCIAS */}
          <section class="flex flex-col gap-4">
            <h2 class="text-lg font-semibold text-foreground">Preferências</h2>
            <Card class="flex flex-col p-6 md:p-8 border-border">
              <div class="flex items-center justify-between border-b border-border pb-6 mb-6">
                <div class="flex items-center gap-4">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><SunIcon /></div>
                  <div class="flex flex-col"><span class="font-medium text-foreground">Modo Escuro</span><span class="text-sm text-muted-foreground">Alternar tema visual do app.</span></div>
                </div>
                <Switch checked={theme() === "dark"} onChange={() => toggleTheme()} />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><GlobeIcon /></div>
                  <div class="flex flex-col"><span class="font-medium text-foreground">Idioma</span><span class="text-sm text-muted-foreground">Selecione a linguagem da interface.</span></div>
                </div>
                <div class="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  <button class={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${idioma() === "PT" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setIdioma("PT")}>PT-BR</button>
                  <button class={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${idioma() === "EN" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setIdioma("EN")}>EN</button>
                </div>
              </div>
            </Card>
          </section>

          {/* SEGURANÇA */}
          <Show when={currentUser()?.provider !== "google"}>
            <section class="flex flex-col gap-4">
              <h2 class="text-lg font-semibold text-foreground">Segurança</h2>
              <Card class="flex flex-col gap-8 p-6 md:p-8 border-border">
                <Input labelText="Senha Atual" type="password" value={senhaAtual()} onInput={e => setSenhaAtual(e.currentTarget.value)} />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input labelText="Nova Senha" type="password" value={novaSenha()} onInput={e => setNovaSenha(e.currentTarget.value)} />
                  <Input labelText="Confirmar Nova Senha" type="password" value={confirmarSenha()} onInput={e => setConfirmarSenha(e.currentTarget.value)} />
                </div>

                <Show when={feedbackSecurity().message}>
                  <div class={`rounded-lg px-4 py-3 text-sm font-medium ${feedbackSecurity().type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-50 text-red-600 border border-red-500/20"}`}>
                    {feedbackSecurity().message}
                  </div>
                </Show>

                <Button variant="primary" class="w-fit" onClick={handleSavePassword} disabled={loadingSecurity()}>
                  <LockIcon /> {loadingSecurity() ? "Processando..." : "Alterar Senha"}
                </Button>
              </Card>
            </section>
          </Show>
        </div>
      </Show>
  );
}