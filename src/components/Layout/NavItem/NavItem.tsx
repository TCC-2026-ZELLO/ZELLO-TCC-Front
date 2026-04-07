import { JSX, Show } from "solid-js"; // Importamos o Show
import { A, useLocation } from "@solidjs/router";

interface NavItemProps {
    label: string;
    icon: JSX.Element;
    href?: string;
    badge?: string | number;
    active?: boolean;
}

export function NavItem(props: NavItemProps) {
    const location = useLocation();

    const safeHref = () => props.href || "#";
    // Compara a rota atual para definir se o item está ativo
    const isActive = () => location.pathname === props.href;

    return (
        <A
            href={safeHref()}
            style={{
                display: "flex",
                position: "relative",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "10px 12px",
                "padding-left": "16px", // Aumentamos um pouco o padding para não encostar na linha
                "border-radius": "var(--radius-full)",
                "text-decoration": "none",
                cursor: "pointer",
                "background-color": isActive() ? "rgba(255, 255, 255, 0.1)" : "transparent",
                color: isActive() ? "#FFFFFF" : "var(--color-muted-foreground)",
                transition: "all 0.2s ease",
            }}
        >
            {/* O STRIP CORRIGIDO */}
            <Show when={isActive()}>
                <div
                    class="zello-navitem-line"
                    style={{
                        position: "absolute",
                        left: "1px",
                        top: "25%", // Centraliza verticalmente ocupando 50% da altura
                        "height": "50%",
                        "width": "3px",
                        "border-radius": "0 4px 4px 0", // Arredonda apenas o lado direito
                        background: "#FFFFFF"
                    }}
                />
            </Show>

            <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
                <span style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    width: "20px",
                    opacity: isActive() ? "1" : "0.7"
                }}>
                    {props.icon}
                </span>
                <span style={{
                    "font-size": "14px",
                    "font-weight": isActive() ? "600" : "500"
                }}>
                    {props.label}
                </span>
            </div>

            {props.badge && (
                <span style={{
                    "background-color": isActive() ? "var(--color-cliente, #7E22CE)" : "rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF",
                    "font-size": "11px",
                    "font-weight": "600",
                    padding: "2px 8px",
                    "border-radius": "12px",
                }}>
                    {props.badge}
                </span>
            )}
        </A>
    );
}