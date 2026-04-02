import { createSignal } from "solid-js";

import { Badge } from "~/components/Badge/Badge";
import { Card } from "~/components/Card/Card";
import { Button } from "~/components/Button/Button";
import { Avatar } from "~/components/Avatar/Avatar";
import { Input } from "~/components/Input/Input";
import { Switch } from "~/components/Switch/Switch";
import { Tabs } from "~/components/Tabs/Tabs";
import { IconButton } from "~/components/IconButton/IconButton";
import { Rating } from "~/components/Rating/Rating";
import { ProgressBar } from "~/components/ProgressBar/ProgressBar";
import { Stepper } from "~/components/Stepper/Stepper";
import { NavItem } from "~/components/NavItem/NavItem";
import {Dropzone} from "~/components/DropZone/DropZone";
import {Timeline} from "~/components/TimeLine/TimeLine";

export default function ZelloComponentsExample() {
    const sectionStyle = { display: "flex", "flex-direction": "column", gap: "var(--space-4)" } as const;
    const rowStyle = { display: "flex", "align-items": "center", gap: "var(--space-4)", "flex-wrap": "wrap" } as const;
    const titleStyle = { "font-size": "var(--font-size-xl)", "font-weight": "var(--font-weight-semibold)", "border-bottom": "1px solid var(--color-border)", "padding-bottom": "var(--space-2)" } as const;

    const [abaAtiva, setAbaAtiva] = createSignal("proximos");
    const [passoAtual, setPassoAtual] = createSignal(2);

    const HeartIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
    const HomeIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>;
    const CalendarIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

    return (
        <main style={{ padding: "var(--space-8)", display: "flex", "flex-direction": "column", gap: "var(--space-10)", "max-width": "1200px", margin: "0 auto" }}>

            <header>
                <h1 style={{ "font-size": "var(--font-size-3xl)", "font-weight": "var(--font-weight-bold)" }}>
                    Design System — Zello
                </h1>
                <p style={{ color: "var(--color-muted-foreground)", "margin-top": "var(--space-2)" }}>
                    Catálogo completo de componentes base para a construção das telas do protótipo Figma.
                </p>
            </header>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>1. Buttons</h2>
                <Card>
                    <div style={rowStyle}>
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="pill">Filtro Pill</Button>
                    </div>
                </Card>
            </section>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>2. Badges</h2>
                <Card>
                    <div style={rowStyle}>
                        <Badge variant="success">Confirmado</Badge>
                        <Badge variant="warning">Pendente</Badge>
                        <Badge variant="error">Cancelado</Badge>
                        <Badge variant="default">Neutro</Badge>
                    </div>
                </Card>
            </section>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>3. Avatars</h2>
                <Card>
                    <div style={rowStyle}>
                        <Avatar size="sm" fallbackInitials="SM" />
                        <Avatar size="md" fallbackInitials="MD" />
                        <Avatar size="lg" fallbackInitials="LG" />
                        <Avatar size="xl" fallbackInitials="XL" />
                    </div>
                </Card>
            </section>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>4. Inputs Seguros</h2>
                <Card>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "var(--space-4)", "max-width": "400px" }}>
                        <Input labelText="Nome Completo" placeholder="Ex: Ana Clara" />
                        <Input searchIcon placeholder="Buscar serviço..." />
                    </div>
                </Card>
            </section>

            <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                <section style={sectionStyle}>
                    <h2 style={titleStyle}>5. Switch (Toggle)</h2>
                    <Card>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "var(--space-6)" }}>
                            <Switch label="Modo Claro" />
                            <Switch label="Receber notificações" checked />
                        </div>
                    </Card>
                </section>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>6. Tabs</h2>
                    <Card>
                        <Tabs
                            activeValue={abaAtiva()}
                            onChange={setAbaAtiva}
                            items={[
                                { label: "Próximos", value: "proximos", badge: 3 },
                                { label: "Concluídos", value: "concluidos" }
                            ]}
                        />
                        <div style={{ "margin-top": "var(--space-4)", padding: "var(--space-4)", "background-color": "var(--color-background)", "border-radius": "var(--radius-md)" }}>
                            Aba selecionada: <strong>{abaAtiva()}</strong>
                        </div>
                    </Card>
                </section>
            </div>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>7. Icon Button & Rating</h2>
                <Card>
                    <div style={rowStyle}>
                        <div style={{ display: "flex", "flex-direction": "column", gap: "var(--space-2)" }}>
                            <span style={{ "font-size": "var(--font-size-xs)" }}>Icon Button (Favorito)</span>
                            <IconButton>{HeartIcon}</IconButton>
                        </div>

                        <div style={{ width: "1px", height: "40px", "background-color": "var(--color-border)", margin: "0 var(--space-4)" }}></div>

                        <div style={{ display: "flex", "flex-direction": "column", gap: "var(--space-2)" }}>
                            <span style={{ "font-size": "var(--font-size-xs)" }}>Rating (4.9 / 5)</span>
                            <Rating value={4} />
                        </div>
                    </div>
                </Card>
            </section>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>8. Stepper & Progress Bar</h2>
                <Card>
                    <div style={{ display: "flex", "flex-direction": "column", gap: "var(--space-8)" }}>
                        <div>
                            <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "var(--space-4)" }}>
                                <span style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-medium)" }}>Reserva (Passo {passoAtual()} de 4)</span>
                                <Button size="sm" variant="outline" onClick={() => setPassoAtual(p => p < 4 ? p + 1 : 1)}>Avançar Passo</Button>
                            </div>
                            <Stepper
                                steps={["Serviço", "Profissional", "Horário", "Confirmar"]}
                                currentStep={passoAtual()}
                            />
                        </div>

                        <hr style={{ border: "none", "border-top": "1px solid var(--color-border)" }} />

                        <div>
                            <div style={{ display: "flex", "justify-content": "space-between", "margin-bottom": "var(--space-2)" }}>
                                <span style={{ "font-size": "var(--font-size-sm)" }}>Progresso Fidelidade</span>
                                <span style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-bold)" }}>2.610 / 3.000 pts</span>
                            </div>
                            <ProgressBar value={2610} max={3000} colorVar="--color-warning" />
                        </div>

                    </div>
                </Card>
            </section>

            <section style={sectionStyle}>
                <h2 style={titleStyle}>9. Dropzone (Upload)</h2>
                <div style={{ "max-width": "300px" }}>
                    <Dropzone />
                </div>
            </section>

            <div style={{ display: "grid", "grid-template-columns": "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>10. NavItem (Sidebar Menu)</h2>
                    <div style={{ "background-color": "var(--color-sidebar)", padding: "var(--space-4)", "border-radius": "var(--radius-lg)" }}>
                        <NavItem label="Início" icon={HomeIcon} active={false} />
                        <NavItem label="Meus Agendamentos" icon={CalendarIcon} active={true} badge={2} />
                        <NavItem label="Favoritos" icon={HeartIcon} active={false} />
                    </div>
                </section>

                <section style={sectionStyle}>
                    <h2 style={titleStyle}>11. Timeline (Agenda)</h2>
                    <Card>
                        <Timeline
                            items={[
                                {
                                    time: "09:00",
                                    duration: "60m",
                                    status: "success",
                                    content: (
                                        <div style={{ display: "flex", gap: "var(--space-3)", "align-items": "center" }}>
                                            <Avatar size="sm" fallbackInitials="AP" />
                                            <div>
                                                <p style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-bold)", "margin": 0 }}>Ana Paula S.</p>
                                                <p style={{ "font-size": "var(--font-size-xs)", color: "var(--color-muted-foreground)", "margin": 0 }}>Limpeza de Pele</p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    time: "10:30",
                                    duration: "45m",
                                    status: "success",
                                    content: (
                                        <div style={{ display: "flex", gap: "var(--space-3)", "align-items": "center" }}>
                                            <Avatar size="sm" fallbackInitials="BL" />
                                            <div>
                                                <p style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-bold)", "margin": 0 }}>Beatriz Lima</p>
                                                <p style={{ "font-size": "var(--font-size-xs)", color: "var(--color-muted-foreground)", "margin": 0 }}>Peeling Químico</p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    time: "12:00",
                                    duration: "90m",
                                    status: "warning",
                                    content: (
                                        <div style={{ display: "flex", gap: "var(--space-3)", "align-items": "center" }}>
                                            <Avatar size="sm" fallbackInitials="CM" />
                                            <div>
                                                <p style={{ "font-size": "var(--font-size-sm)", "font-weight": "var(--font-weight-bold)", "margin": 0 }}>Carla Mendes</p>
                                                <p style={{ "font-size": "var(--font-size-xs)", color: "var(--color-muted-foreground)", "margin": 0 }}>Microagulhamento</p>
                                            </div>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </section>
            </div>

        </main>
    );
}