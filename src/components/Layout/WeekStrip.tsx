import { createSignal, createMemo, createEffect, For, Show, on } from "solid-js";
import { Input } from "../Widgets/Input";

export interface DayCount {
    pending: number;
    confirmed: number;
}

interface Props {
    selectedDate: string;
    onSelect: (date: string) => void;
    counts?: Record<string, DayCount>;
    onRangeChange?: (dates: string[]) => void;
    loading?: boolean;
    locale?: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const toKey = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseKey = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
};

const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const weekday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - weekday);
    return d;
};

const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

export function WeekStrip(props: Props) {
    const locale = () => props.locale ?? "pt-BR";

    const [anchor, setAnchor] = createSignal(
        startOfWeek(parseKey(props.selectedDate)),
    );

    createEffect(
        on(
            () => props.selectedDate,
            (date) => {
                const week = startOfWeek(parseKey(date));
                if (toKey(week) !== toKey(anchor())) setAnchor(week);
            },
            { defer: true },
        ),
    );

    const days = createMemo(() =>
        Array.from({ length: 7 }, (_, i) => {
            const date = addDays(anchor(), i);
            return {
                key: toKey(date),
                date,
                dayNumber: date.getDate(),
                weekday: new Intl.DateTimeFormat(locale(), { weekday: "short" })
                    .format(date)
                    .replace(".", ""),
            };
        }),
    );

    createEffect(() => props.onRangeChange?.(days().map((d) => d.key)));

    const monthLabel = createMemo(() => {
        const label = new Intl.DateTimeFormat(locale(), {
            month: "long",
            year: "numeric",
        }).format(addDays(anchor(), 3));
        return label.charAt(0).toUpperCase() + label.slice(1);
    });

    const todayKey = toKey(new Date());
    const countFor = (key: string): DayCount =>
        props.counts?.[key] ?? { pending: 0, confirmed: 0 };

    const weekPending = createMemo(() =>
        days().reduce((sum, d) => sum + countFor(d.key).pending, 0),
    );

    const shiftWeek = (weeks: number) =>
        setAnchor(addDays(anchor(), weeks * 7));

    return (
        <div class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-1">
                    <button
                        class="size-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        onClick={() => shiftWeek(-1)}
                        aria-label="Semana anterior"
                    >
                        ‹
                    </button>
                    <span class="min-w-40 text-center font-semibold text-foreground">
                        {monthLabel()}
                    </span>
                    <button
                        class="size-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        onClick={() => shiftWeek(1)}
                        aria-label="Próxima semana"
                    >
                        ›
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <Show when={weekPending() > 0}>
                        <span class="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning-foreground">
                            <span class="size-1.5 rounded-full bg-warning" />
                            {weekPending()} pendente{weekPending() > 1 ? "s" : ""} nesta semana
                        </span>
                    </Show>
                    <button
                        class="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        onClick={() => props.onSelect(todayKey)}
                    >
                        Hoje
                    </button>
                    <Input
                        type="date"
                        value={props.selectedDate}
                        onInput={(e) => props.onSelect(e.currentTarget.value)}
                        class="w-40"
                    />
                </div>
            </div>

            <div
                class="grid grid-cols-7 gap-1.5"
                classList={{ "opacity-60": props.loading }}
            >
                <For each={days()}>
                    {(day) => {
                        const count = () => countFor(day.key);
                        const isSelected = () => day.key === props.selectedDate;
                        const isToday = () => day.key === todayKey;

                        return (
                            <button
                                onClick={() => props.onSelect(day.key)}
                                aria-pressed={isSelected()}
                                aria-label={`${day.weekday} ${day.dayNumber}: ${count().pending} pendentes, ${count().confirmed} confirmados`}
                                class="flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-colors"
                                classList={{
                                    "bg-primary text-primary-foreground border-primary":
                                        isSelected(),
                                    "bg-card border-border hover:bg-secondary":
                                        !isSelected(),
                                    "border-primary/50": !isSelected() && isToday(),
                                }}
                            >
                                <span
                                    class="text-[11px] lowercase"
                                    classList={{
                                        "text-primary-foreground/70": isSelected(),
                                        "text-muted-foreground": !isSelected(),
                                    }}
                                >
                                    {day.weekday}
                                </span>

                                <span
                                    class="text-base font-semibold"
                                    classList={{ "text-foreground": !isSelected() }}
                                >
                                    {day.dayNumber}
                                </span>

                                <span class="flex h-2 items-center gap-0.5">
                                    <For each={Array(Math.min(count().pending, 3))}>
                                        {() => (
                                            <span
                                                class="size-1.5 rounded-full"
                                                classList={{
                                                    "bg-primary-foreground": isSelected(),
                                                    "bg-warning": !isSelected(),
                                                }}
                                            />
                                        )}
                                    </For>
                                    <For each={Array(Math.min(count().confirmed, 3))}>
                                        {() => (
                                            <span
                                                class="size-1.5 rounded-full"
                                                classList={{
                                                    "bg-primary-foreground/50": isSelected(),
                                                    "bg-muted-foreground/40": !isSelected(),
                                                }}
                                            />
                                        )}
                                    </For>
                                    <Show
                                        when={count().pending > 3 || count().confirmed > 3}
                                    >
                                        <span
                                            class="text-[9px] leading-none"
                                            classList={{
                                                "text-primary-foreground/70": isSelected(),
                                                "text-muted-foreground": !isSelected(),
                                            }}
                                        >
                                            +
                                        </span>
                                    </Show>
                                </span>
                            </button>
                        );
                    }}
                </For>
            </div>

            <div class="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span class="flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full bg-warning" /> aguardando aprovação
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full bg-muted-foreground/40" /> confirmado
                </span>
            </div>
        </div>
    );
}