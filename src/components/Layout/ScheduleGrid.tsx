import { For, Show } from "solid-js";
import { formatTime, localizeDomain, t } from "../../core/i18n";
import { LockIcon } from "../Icons/Icons";
import { Avatar } from "../Widgets/Avatar";

export type Professional = {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
};

export type ScheduleGridItem = {
    id: string;
    date?: string;
    professionalId?: string;
    clientName?: string;
    service?: string;
    reason?: string;
    startTime: string;
    durationMins: number;
    status?: "confirmed" | "pending" | "completed" | "no_show";
    colorClass?: string;
    type?: "appointment" | "block";
};

export type Appointment = ScheduleGridItem;

interface ScheduleGridProps {
    professionals: Professional[];
    appointments: ScheduleGridItem[];
    startHour: number;
    endHour: number;
    compact?: boolean;
    onAppointmentClick: (appointment: ScheduleGridItem) => void;
}

export function ScheduleGrid(props: ScheduleGridProps) {
    const hoursRowHeight = () => (props.compact ? 62 : 80);

    const hoursList = () => {
        const list: string[] = [];
        for (let i = props.startHour; i <= props.endHour; i++) {
            list.push(`${i.toString().padStart(2, "0")}:00`);
        }
        return list;
    };

    const getStylesForAppointment = (appt: ScheduleGridItem) => {
        const [hour, minute] = appt.startTime.split(":").map(Number);
        const rowH = hoursRowHeight();
        const baseTop = (hour - props.startHour + minute / 60) * rowH;
        const baseHeight = Math.max(28, (appt.durationMins / 60) * rowH);
        const gap = 3;

        return {
            top: `${baseTop + gap}px`,
            height: `${Math.max(24, baseHeight - gap * 2)}px`,
        };
    };

    const resolveBlockClasses = (appt: ScheduleGridItem) => {
        if (appt.type === "block") {
            return "bg-muted text-muted-foreground border border-border";
        }
        if (appt.status === "pending") {
            return "bg-warning text-warning-foreground border-2 border-dashed border-border";
        }
        if (appt.status === "completed") {
            return "bg-success text-white border border-border";
        }
        if (appt.status === "no_show") {
            return "bg-error text-error-foreground border border-border";
        }
        if (appt.colorClass && !appt.colorClass.includes("bg-primary")) {
            return `${appt.colorClass} text-white`;
        }
        return "bg-primary text-primary-foreground border border-border";
    };

    const minWidthClass = () =>
        props.professionals.length <= 1
            ? "min-w-[300px]"
            : "min-w-[540px] sm:min-w-[760px]";

    return (
        <div class="overflow-x-auto rounded-xl border border-border bg-card">
            <div class={minWidthClass()}>
                <div class="flex border-b border-border">
                    <div class="w-20 shrink-0 border-r border-border bg-muted p-3 text-center text-xs font-semibold text-muted-foreground">
                        {t().teamSchedule.hourColumn}
                    </div>
                    <For each={props.professionals}>
                        {(prof) => (
                            <div class="flex min-w-[140px] flex-1 items-center justify-center gap-2 border-r border-border p-3 last:border-r-0">
                                <Avatar size="sm" fallbackInitials={prof.initials} />
                                <span class="truncate text-sm font-semibold text-foreground">
                                    {prof.name}
                                </span>
                            </div>
                        )}
                    </For>
                </div>

                <div class="relative flex bg-card">
                    <div class="w-20 shrink-0 border-r border-border bg-muted">
                        <For each={hoursList()}>
                            {(hour) => (
                                <div
                                    class="border-b border-border px-1 text-center text-[11px] font-medium text-muted-foreground"
                                    style={{
                                        height: `${hoursRowHeight()}px`,
                                        padding: "8px 2px",
                                    }}
                                >
                                    {formatTime(hour)}
                                </div>
                            )}
                        </For>
                    </div>

                    <div class="relative flex flex-1">
                        <div class="pointer-events-none absolute inset-0 z-0 flex flex-col">
                            <For each={hoursList()}>
                                {() => (
                                    <div
                                        class="w-full border-b border-border"
                                        style={{ height: `${hoursRowHeight()}px` }}
                                    />
                                )}
                            </For>
                        </div>

                        <For each={props.professionals}>
                            {(prof) => (
                                <div class="relative min-w-[140px] flex-1 border-r border-border min-h-full last:border-r-0">
                                    <For
                                        each={props.appointments.filter(
                                            (a) =>
                                                !a.professionalId ||
                                                a.professionalId === prof.id,
                                        )}
                                    >
                                        {(appt) => (
                                            <div
                                                onClick={() =>
                                                    props.onAppointmentClick(appt)
                                                }
                                                class={`absolute right-1 left-1 z-10 cursor-pointer overflow-hidden rounded-md p-2 shadow-sm transition-transform hover:scale-[1.01] ${resolveBlockClasses(
                                                    appt,
                                                )}`}
                                                style={{
                                                    ...getStylesForAppointment(appt),
                                                    ...(appt.type === "block"
                                                        ? {
                                                              backgroundImage:
                                                                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.08) 10px, rgba(128,128,128,0.08) 20px)",
                                                          }
                                                        : {}),
                                                }}
                                            >
                                                <Show
                                                    when={appt.type === "block"}
                                                    fallback={
                                                        <>
                                                            <div class="truncate text-xs font-bold">
                                                                {appt.clientName}
                                                            </div>
                                                            <div class="truncate text-[10px] opacity-90">
                                                                {localizeDomain.serviceName(
                                                                    appt.service,
                                                                )}
                                                            </div>
                                                        </>
                                                    }
                                                >
                                                    <div class="mt-0.5 flex flex-col gap-0.5 truncate text-xs font-bold text-muted-foreground">
                                                        <span class="flex items-center gap-1 truncate">
                                                            <LockIcon class="size-3.5 shrink-0" />
                                                            <span class="truncate">
                                                                {appt.reason ||
                                                                    t().teamSchedule.blockedSlot}
                                                            </span>
                                                        </span>
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
