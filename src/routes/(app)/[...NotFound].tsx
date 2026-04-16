import { createSignal } from "solid-js";

import { Badge } from "~/components/Widgets/Badge";
import { Card } from "~/components/Widgets/Card";
import { Button } from "~/components/Widgets/Button";
import { Avatar } from "~/components/Widgets/Avatar";
import { Input } from "~/components/Widgets/Input";
import { Switch } from "~/components/Widgets/Switch";
import { Tabs } from "~/components/Widgets/Tabs";
import { IconButton } from "~/components/Widgets/IconButton";
import { Rating } from "~/components/Widgets/Rating";
import { ProgressBar } from "~/components/Widgets/ProgressBar";
import { Stepper } from "~/components/Widgets/Stepper";
import { NavItem } from "~/components/Layout/NavItem";
import { Dropzone } from "~/components/Widgets/DropZone";
import { Timeline } from "~/components/Widgets/TimeLine";
import { CalendarIcon, HeartIcon, HomeIcon } from "~/components/Icons/Icons";

export default function ZelloComponentsExample() {
    const [abaAtiva, setAbaAtiva] = createSignal("proximos");
    const [passoAtual, setPassoAtual] = createSignal(2);

    return (
        <main class="mx-auto flex max-w-[1200px] flex-col gap-10 p-8">
            <header>
                <h1 class="text-3xl font-bold">Design System — Zello</h1>
                <p class="mt-2 text-muted-foreground">
                    Catálogo completo de componentes base para a construção das telas do protótipo Figma.
                </p>
            </header>

            {/* 1. Buttons */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">1. Buttons</h2>
                <Card>
                    <div class="flex flex-wrap items-center gap-4">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="primary" pill>Pill Shape</Button>
                    </div>
                </Card>
            </section>

            {/* 2. Badges */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">2. Badges</h2>
                <Card>
                    <div class="flex flex-wrap items-center gap-4">
                        <Badge variant="success">Confirmado</Badge>
                        <Badge variant="warning">Pendente</Badge>
                        <Badge variant="error">Cancelado</Badge>
                        <Badge variant="default">Neutro</Badge>
                    </div>
                </Card>
            </section>

            {/* 3. Avatars */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">3. Avatars</h2>
                <Card>
                    <div class="flex flex-wrap items-center gap-4">
                        <Avatar size="sm" fallbackInitials="SM" />
                        <Avatar size="md" fallbackInitials="MD" />
                        <Avatar size="lg" fallbackInitials="LG" />
                        <Avatar size="xl" fallbackInitials="XL" />
                    </div>
                </Card>
            </section>

            {/* 4. Inputs */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">4. Inputs Seguros</h2>
                <Card>
                    <div class="flex max-w-sm flex-col gap-4">
                        <Input labelText="Nome Completo" placeholder="Ex: Ana Clara" />
                        <Input searchIcon placeholder="Buscar serviço..." />
                    </div>
                </Card>
            </section>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 5. Switch */}
                <section class="flex flex-col gap-4">
                    <h2 class="border-b border-border pb-2 text-xl font-semibold">5. Switch (Toggle)</h2>
                    <Card>
                        <div class="flex flex-col gap-6">
                            <Switch label="Modo Claro" />
                            <Switch label="Receber notificações" checked />
                        </div>
                    </Card>
                </section>

                {/* 6. Tabs */}
                <section class="flex flex-col gap-4">
                    <h2 class="border-b border-border pb-2 text-xl font-semibold">6. Tabs</h2>
                    <Card>
                        <Tabs
                            activeValue={abaAtiva()}
                            onChange={(valorSelecionado) => setAbaAtiva(valorSelecionado)}
                            items={[
                                { label: "Próximos", value: "proximos", badge: 3 },
                                { label: "Concluídos", value: "concluidos" }
                            ]}
                        />
                        <div class="mt-4 rounded-md border border-border bg-background p-4">
                            Aba selecionada: <span class="font-bold text-primary">{abaAtiva()}</span>
                        </div>
                    </Card>
                </section>
            </div>

            {/* 7. Icon Button & Rating */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">7. Icon Button & Rating</h2>
                <Card>
                    <div class="flex flex-wrap items-center gap-4">
                        <div class="flex flex-col gap-2">
                            <span class="text-xs">Icon Button (Favorito)</span>
                            <IconButton> <HeartIcon/> </IconButton>
                        </div>

                        <div class="mx-4 hidden h-10 w-px bg-border md:block"></div>

                        <div class="flex flex-col gap-2">
                            <span class="text-xs">Rating (4.9 / 5)</span>
                            <Rating value={4} />
                        </div>
                    </div>
                </Card>
            </section>

            {/* 8. Stepper & Progress Bar */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">8. Stepper & Progress Bar</h2>
                <Card>
                    <div class="flex flex-col gap-8">
                        <div>
                            <div class="mb-4 flex items-center justify-between">
                                <span class="text-sm font-medium">Reserva (Passo {passoAtual()} de 4)</span>
                                <Button size="sm" variant="outline" onClick={() => setPassoAtual(p => p < 4 ? p + 1 : 1)}>Avançar Passo</Button>
                            </div>
                            <Stepper
                                steps={["Serviço", "Profissional", "Horário", "Confirmar"]}
                                currentStep={passoAtual()}
                            />
                        </div>

                        <hr class="border-t border-border" />

                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-sm">Progresso Fidelidade</span>
                                <span class="text-sm font-bold">2.610 / 3.000 pts</span>
                            </div>
                            <ProgressBar value={2610} max={3000} colorVar="--color-warning" />
                        </div>
                    </div>
                </Card>
            </section>

            {/* 9. Dropzone */}
            <section class="flex flex-col gap-4">
                <h2 class="border-b border-border pb-2 text-xl font-semibold">9. Dropzone (Upload)</h2>
                <div class="max-w-[300px]">
                    <Dropzone />
                </div>
            </section>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 10. NavItem */}
                <section class="flex flex-col gap-4">
                    <h2 class="border-b border-border pb-2 text-xl font-semibold">10. NavItem (Sidebar Menu)</h2>
                    <div class="flex flex-col gap-1 rounded-lg bg-sidebar p-4">
                        <NavItem label="Início" icon=<HomeIcon/> href="/" />
                        <NavItem label="Meus Agendamentos" icon=<CalendarIcon/> badge={2} href="/example-active" />
                        <NavItem label="Favoritos" icon=<HeartIcon/> href="/favoritos" />
                    </div>
                </section>

                {/* 11. Timeline */}
                <section class="flex flex-col gap-4">
                    <h2 class="border-b border-border pb-2 text-xl font-semibold">11. Timeline (Agenda)</h2>
                    <Card>
                        <Timeline
                            items={[
                                {
                                    time: "09:00",
                                    duration: "60m",
                                    status: "success",
                                    content: (
                                        <div class="flex items-center gap-3">
                                            <Avatar size="sm" fallbackInitials="AP" />
                                            <div>
                                                <p class="text-sm font-bold">Ana Paula S.</p>
                                                <p class="text-xs text-muted-foreground">Limpeza de Pele</p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    time: "10:30",
                                    duration: "45m",
                                    status: "success",
                                    content: (
                                        <div class="flex items-center gap-3">
                                            <Avatar size="sm" fallbackInitials="BL" />
                                            <div>
                                                <p class="text-sm font-bold">Beatriz Lima</p>
                                                <p class="text-xs text-muted-foreground">Peeling Químico</p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    time: "12:00",
                                    duration: "90m",
                                    status: "warning",
                                    content: (
                                        <div class="flex items-center gap-3">
                                            <Avatar size="sm" fallbackInitials="CM" />
                                            <div>
                                                <p class="text-sm font-bold">Carla Mendes</p>
                                                <p class="text-xs text-muted-foreground">Microagulhamento</p>
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