import { For, Show } from "solid-js";
import { Avatar } from "../Widgets/Avatar";

export type Professional = { id: string; name: string; initials: string; avatarUrl?: string };

export type Appointment = {
    id: string;
    professionalId?: string;
    clientName?: string;
    service?: string;
    reason?: string;
    startTime: string;
    durationMins: number;
    status?: "confirmed" | "pending" | "completed";
    colorClass?: string;
    type?: "appointment" | "block";
};

interface ScheduleGridProps {
    professionals: Professional[];
    appointments: Appointment[];
    startHour: number;
    endHour: number;
    onAppointmentClick: (appointment: Appointment) => void;
}

export function ScheduleGrid(props: ScheduleGridProps) {
    const hoursRowHeight = 80;

    const hoursList = () => {
        const list = [];
        for (let i = props.startHour; i <= props.endHour; i++) {
            list.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return list;
    };

    const getStylesForAppointment = (appt: Appointment) => {
        const [hour, minute] = appt.startTime.split(':').map(Number);
        const baseTop = ((hour - props.startHour) + (minute / 60)) * hoursRowHeight;
        const baseHeight = (appt.durationMins / 60) * hoursRowHeight;
        const gap = 4;

        return {
            top: `${baseTop + gap}px`,
            height: `${baseHeight - (gap * 2)}px`,
        };
    };

    return (
        <div class="overflow-x-auto rounded-lg border border-border bg-card">
            <div class="min-w-[800px]">
                <div class="flex border-b border-border">
                    <div class="w-20 shrink-0 border-r border-border bg-muted p-3 text-xs font-semibold text-muted-foreground">
                        HORA
                    </div>
                    <For each={props.professionals}>
                        {(prof) => (
                            <div class="flex flex-1 items-center justify-center gap-2 border-r border-border p-3">
                                <Avatar size="sm" fallbackInitials={prof.initials} />
                                <span class="text-sm font-semibold text-foreground">{prof.name}</span>
                            </div>
                        )}
                    </For>
                </div>

                <div class="flex relative bg-card">
                    <div class="w-20 shrink-0 border-r border-border bg-muted">
                        <For each={hoursList()}>
                            {(hour) => (
                                <div
                                    class="border-b border-border text-center text-xs font-medium text-muted-foreground"
                                    style={{ height: `${hoursRowHeight}px`, padding: "8px 0" }}
                                >
                                    {hour}
                                </div>
                            )}
                        </For>
                    </div>

                    <div class="relative flex flex-1">
                        <div class="absolute inset-0 z-0 pointer-events-none flex flex-col">
                            <For each={hoursList()}>
                                {() => <div class="border-b border-border w-full" style={{ height: `${hoursRowHeight}px` }}></div>}
                            </For>
                        </div>

                        <For each={props.professionals}>
                            {(prof) => (
                                <div class="relative flex-1 border-r border-border min-h-full">
                                    <For each={props.appointments.filter(a => !a.professionalId || a.professionalId === prof.id)}>
                                        {(appt) => (
                                            <div
                                                onClick={() => props.onAppointmentClick(appt)}
                                                class={`absolute left-1 right-1 z-10 cursor-pointer overflow-hidden rounded-md p-2 transition-transform hover:scale-[1.02] shadow-sm ${
                                                    appt.type === "block"
                                                        ? "bg-muted border border-border"
                                                        : appt.colorClass
                                                } ${appt.status === 'pending' ? 'opacity-80 border-2 border-dashed border-white/50' : ''}`}
                                                style={{
                                                    ...getStylesForAppointment(appt),
                                                    ...(appt.type === 'block' ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)' } : {})
                                                }}
                                            >
                                                <Show
                                                    when={appt.type === 'block'}
                                                    fallback={
                                                        <>
                                                            <div class="text-xs font-bold truncate text-white">{appt.clientName}</div>
                                                            <div class="text-[10px] opacity-90 truncate text-white">{appt.service}</div>
                                                        </>
                                                    }
                                                >
                                                    <div class="text-xs font-bold truncate text-muted-foreground flex flex-col gap-1 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                        {appt.reason || "Bloqueado"}
                                                    </div>
                                                </Show>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </div>
        </div>
    );
}
