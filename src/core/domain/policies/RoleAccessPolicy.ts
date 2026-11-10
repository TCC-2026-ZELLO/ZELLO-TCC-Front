import type { AccountRole } from "../entities/models";

export interface RoleDescriptor {
    role: AccountRole;
    backendRole: "client" | "professional" | "manager";
    defaultRoute: string;
    colorClass: string;
}

const ROLE_STRATEGIES: Record<AccountRole, RoleDescriptor> = {
    cliente: {
        role: "cliente",
        backendRole: "client",
        defaultRoute: "/explore",
        colorClass: "bg-cliente",
    },
    profissional: {
        role: "profissional",
        backendRole: "professional",
        defaultRoute: "/professional_settings",
        colorClass: "bg-profissional",
    },
    estabelecimento: {
        role: "estabelecimento",
        backendRole: "manager",
        defaultRoute: "/team_schedule",
        colorClass: "bg-gestor",
    },
};

export const RoleAccessPolicy = {
    getDescriptor(role: AccountRole): RoleDescriptor {
        return ROLE_STRATEGIES[role] ?? ROLE_STRATEGIES.cliente;
    },

    resolvePrimaryRole(backendRoles: readonly string[] = []): AccountRole {
        if (backendRoles.includes("manager")) return "estabelecimento";
        if (backendRoles.includes("professional")) return "profissional";
        return "cliente";
    },

    getAvailableRoles(backendRoles: readonly string[] = []): AccountRole[] {
        const roles: AccountRole[] = ["cliente"];
        if (backendRoles.includes("professional")) roles.push("profissional");
        if (backendRoles.includes("manager")) roles.push("estabelecimento");
        return roles;
    },

    nextRole(current: AccountRole, backendRoles: readonly string[] = []): AccountRole {
        const available = RoleAccessPolicy.getAvailableRoles(backendRoles);
        if (available.length <= 1) return available[0] || "cliente";
        const idx = available.indexOf(current);
        return available[idx === -1 ? 0 : (idx + 1) % available.length];
    },

    canAccess(currentRole: AccountRole, allowedRoles?: readonly AccountRole[]): boolean {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        return allowedRoles.includes(currentRole);
    },

    getDefaultRoute(role: AccountRole): string {
        return ROLE_STRATEGIES[role]?.defaultRoute ?? "/explore";
    },
};
