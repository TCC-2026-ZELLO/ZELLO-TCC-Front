import { JSX, Component } from "solid-js";
import "./Card.css";

export function Card(props: { children: JSX.Element; class?: string }) {
    return (
        <div class={`zello-card ${props.class || ""}`}>
            {props.children}
        </div>
    );
}