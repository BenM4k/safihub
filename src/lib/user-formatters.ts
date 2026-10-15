import { formatDateTime } from "./order-formatters";

/**
 * Returns user initials for avatar fallback (e.g., "Eric Munyaga" -> "EM").
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * Formats user email, suppressing synthetic placeholder addresses.
 */
export function formatUserEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const trimmed = email.trim();
  if (trimmed.endsWith("@guest.invalid") || trimmed.includes("guest.invalid")) {
    return "—";
  }
  return trimmed;
}

/**
 * Formats relative last login time with human-readable French phrases.
 */
export function formatRelativeLastLogin(date: Date | string | null | undefined): string {
  if (!date) return "Jamais connecté";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Jamais connecté";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 30) return `Il y a ${diffDays} j`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;

  return formatDateTime(d);
}

/**
 * Checks whether an account has never logged in or has been inactive for more than N days.
 */
export function isUserInactive(
  lastLoginAt: Date | string | null | undefined,
  createdAt: Date | string | null | undefined,
  daysThreshold = 30
): boolean {
  if (!lastLoginAt) {
    // If account was created more than 7 days ago and never logged in, mark as inactive
    if (!createdAt) return true;
    const createdTime = new Date(createdAt).getTime();
    return Date.now() - createdTime > 7 * 24 * 60 * 60 * 1000;
  }

  const loginTime = new Date(lastLoginAt).getTime();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
  return Date.now() - loginTime > thresholdMs;
}

/**
 * Maps role to French label and badge styling tokens.
 */
export function getRoleBadgeInfo(role: string | null | undefined): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (role) {
    case "admin":
      return {
        label: "Administrateur",
        badgeClass: "bg-purple-50 text-purple-700 border-2 border-purple-300",
        dotClass: "bg-purple-500",
      };
    case "operator":
      return {
        label: "Opérateur",
        badgeClass: "bg-blue-50 text-blue-700 border-2 border-blue-300",
        dotClass: "bg-blue-500",
      };
    case "courier":
      return {
        label: "Coursier",
        badgeClass: "bg-amber-50 text-amber-700 border-2 border-amber-300",
        dotClass: "bg-amber-500",
      };
    case "house":
      return {
        label: "Pressing",
        badgeClass: "bg-emerald-50 text-emerald-700 border-2 border-emerald-300",
        dotClass: "bg-emerald-500",
      };
    case "customer":
      return {
        label: "Client",
        badgeClass: "bg-slate-100 text-slate-700 border-2 border-slate-300",
        dotClass: "bg-slate-500",
      };
    default:
      return {
        label: role ? role.charAt(0).toUpperCase() + role.slice(1) : "—",
        badgeClass: "bg-muted text-muted-foreground border-2 border-border-strong",
        dotClass: "bg-muted-foreground",
      };
  }
}
