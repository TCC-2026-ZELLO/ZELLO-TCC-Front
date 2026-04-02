import { For, Component } from "solid-js";
import "./Tabs.css";

export interface TabItem {
    label: string;
    value: string;
    badge?: number | string;
}

export interface TabsProps {
    items: TabItem[];
    activeValue: string;
    onChange: (value: string) => void;
    class?: string;
}

export function Tabs(props: TabsProps) {
    return (
        <div class={`zello-tabs-container ${props.class || ""}`}>
            <div class="zello-tabs-list" role="tablist">
                <For each={props.items}>
                    {(item) => (
                        <button
                            type="button"
                            role="tab"
                            class="zello-tab-trigger"
                            data-state={props.activeValue === item.value ? "active" : "inactive"}
                            onClick={() => props.onChange(item.value)}
                        >
                            {item.label}

                            {item.badge !== undefined && (
                                <span class="zello-tab-badge">({item.badge})</span>
                            )}
                        </button>
                    )}
                </For>
            </div>
        </div>
    );
}