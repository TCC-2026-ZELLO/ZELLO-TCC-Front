import { JSX, Component } from "solid-js";
import "./Dropzone.css";

export function Dropzone(props: JSX.HTMLAttributes<HTMLDivElement>) {
    return (
        <div class={`zello-dropzone ${props.class || ""}`} {...props}>
            <div class="zello-dropzone-icon">+</div>
            <p class="zello-dropzone-text">Arraste ou clique<br/>para adicionar</p>
        </div>
    );
}