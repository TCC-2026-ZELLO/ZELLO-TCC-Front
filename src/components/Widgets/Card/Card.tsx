import { JSX } from "solid-js";
import "./Card.css";

export function Card(props: {
    children: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties | string
}) {
    return (
        <div
            class={`zello-card ${props.class || ""}`}
            style={props.style}
        >
            {props.children}
        </div>
    );
}