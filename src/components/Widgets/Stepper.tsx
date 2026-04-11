import { For } from "solid-js";

export function Stepper(props: { steps: string[]; currentStep: number }) {
    return (
        <div class="flex items-center justify-between w-full max-w-[400px] mx-auto">
            <For each={props.steps}>
                {(step, index) => {
                    const stepNum = index() + 1;
                    const isActive = stepNum === props.currentStep;
                    const isPast = stepNum < props.currentStep;

                    return (
                        <div class="flex flex-col items-center gap-2 relative flex-1">

                            <div
                                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-all duration-150"
                                classList={{
                                    "bg-primary text-primary-foreground": isActive || isPast,
                                    "ring-4 ring-primary/10": isActive,
                                    "bg-secondary text-muted-foreground": !isActive && !isPast
                                }}
                            >
                                {stepNum}
                            </div>

                            <span
                                class="text-xs"
                                classList={{
                                    "text-primary font-bold": isActive,
                                    "text-muted-foreground font-medium": !isActive
                                }}
                            >
                                {step}
                            </span>

                            {stepNum !== props.steps.length && (
                                <div
                                    class="absolute top-4 left-1/2 w-full h-[2px] z-0"
                                    classList={{
                                        "bg-primary": isPast,
                                        "bg-border": !isPast
                                    }}
                                />
                            )}
                        </div>
                    );
                }}
            </For>
        </div>
    );
}