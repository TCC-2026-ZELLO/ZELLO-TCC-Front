import { JSX, Component } from "solid-js";
import "./NavItem.css";

export interface NavItemProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
    icon?: JSX.Element;
    label: string;
    active?: boolean;
    badge?: number;
}

export function NavItem(props: NavItemProps) {
    return (
        <a class="zello-navitem" data-active={props.active} {...props}>
            <div class="zello-navitem-content">
                {props.icon && <span class="zello-navitem-icon">{props.icon}</span>}
                <span class="zello-navitem-label">{props.label}</span>
            </div>
            {props.badge !== undefined && <span class="zello-navitem-badge">{props.badge}</span>}
        </a>
    );
};