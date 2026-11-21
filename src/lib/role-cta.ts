import type { AuthenticatedUser } from "@/services/auth/guards";

export interface RoleCtaInfo {
  href: string;
  isExternalOrAnchor: boolean;
  roleKey: "admin" | "courier" | "house" | "customer" | "guest";
}

/**
 * Returns role-appropriate destination href and key for landing page CTAs.
 */
export function getRoleCta(user?: AuthenticatedUser | null): RoleCtaInfo {
  if (!user || user.isGuest) {
    return {
      href: "/houses",
      isExternalOrAnchor: false,
      roleKey: "guest",
    };
  }

  switch (user.role) {
    case "admin":
      return {
        href: "/admin",
        isExternalOrAnchor: false,
        roleKey: "admin",
      };
    case "courier":
      return {
        href: "/courier",
        isExternalOrAnchor: false,
        roleKey: "courier",
      };
    case "house":
      return {
        href: "/partner",
        isExternalOrAnchor: false,
        roleKey: "house",
      };
    case "customer":
    default:
      return {
        href: "/houses",
        isExternalOrAnchor: false,
        roleKey: "customer",
      };
  }
}
