import { Component, For, JSX } from "solid-js";
import "./Timeline.css";

export interface TimelineItem {
    time: string;
    duration?: string;
    status: "success" | "warning" | "default";
    content: JSX.Element;
}

export function Timeline(props: { items: TimelineItem[] }) {
    return (
        <div class="zello-timeline">
            <For each={props.items}>
                {(item) => (
                    <div class="zello-timeline-item">
                        <div class="zello-timeline-time">
                            <strong>{item.time}</strong>
                            {item.duration && <span>{item.duration}</span>}
                        </div>

                        <div class="zello-timeline-divider">
                            <div class="zello-timeline-dot" data-status={item.status}></div>
                            <div class="zello-timeline-line"></div>
                        </div>

                        <div class="zello-timeline-content">
                            {item.content}
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
}