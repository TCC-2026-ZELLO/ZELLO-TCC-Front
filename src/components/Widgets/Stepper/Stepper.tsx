import { For } from "solid-js";
import "./Stepper.css";

export function Stepper(props: { steps: string[]; currentStep: number }) {
    return (
        <div class="zello-stepper">
            <For each={props.steps}>
                {(step, index) => {
                    const stepNum = index() + 1;
                    const isActive = stepNum === props.currentStep;
                    const isPast = stepNum < props.currentStep;

                    return (
                        <div class="zello-step-item" data-state={isActive ? "active" : isPast ? "past" : "future"}>
                            <div class="zello-step-circle">{stepNum}</div>
                            <span class="zello-step-label">{step}</span>

                            {stepNum !== props.steps.length && <div class="zello-step-line"></div>}
                        </div>
                    );
                }}
            </For>
        </div>
    );
}