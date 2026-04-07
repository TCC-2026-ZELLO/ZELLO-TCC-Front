import { Component } from "solid-js";
import "./ProgressBar.css";

export function ProgressBar(props: { value: number; max?: number; colorVar?: string }){
    const percent = () => Math.min(100, Math.max(0, (props.value / (props.max || 100)) * 100));

    return (
        <div class="zello-progress-bg">
            <div
                class="zello-progress-fill"
                style={`width: ${percent()}%; background-color: var(${props.colorVar || '--color-warning'});`}
            ></div>
        </div>
    );
}